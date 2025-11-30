const express = require('express');
const router = express.Router();
const Mux = require('@mux/mux-node');
const prisma = require('../lib/prisma');
const { requireAuth, requireTeacher } = require('../middleware/auth');

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
});

// Create upload URL
router.post('/upload-url', requireAuth(), requireTeacher(), async (req, res) => {
    try {
        const { courseId } = req.body;
        if (!courseId) return res.status(400).json({ error: 'courseId required' });
        const course = await prisma.course.findUnique({ where: { id: courseId }, select: { instructorId: true } });
        if (!course) return res.status(404).json({ error: 'Course not found' });
        // instructor check already ensured by requireTeacher, but we confirm ownership for robustness
        const authClerkId = req.auth().userId;
        const instructor = await prisma.user.findUnique({ where: { clerkId: authClerkId }, select: { id: true } });
        if (!instructor || instructor.id !== course.instructorId) {
            return res.status(403).json({ error: 'Not course instructor' });
        }
        const upload = await mux.video.uploads.create({
            cors_origin: '*',
            new_asset_settings: { playback_policy: ['public'] },
        });
        res.json({ uploadId: upload.id, uploadUrl: upload.url });
    } catch (error) {
        console.error('Mux upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get asset details
router.get('/asset/:assetId', async (req, res) => {
    try {
        const asset = await mux.video.assets.retrieve(req.params.assetId);

        res.json({
            id: asset.id,
            status: asset.status,
            playbackId: asset.playback_ids?.[0]?.id,
            duration: asset.duration,
        });
    } catch (error) {
        console.error('Mux asset error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete asset
router.delete('/asset/:assetId', requireAuth(), requireTeacher(), async (req, res) => {
    try {
        const { assetId } = req.params;
        // Find lesson referencing this asset
        const lesson = await prisma.lesson.findFirst({ where: { muxAssetId: assetId }, select: { id: true, courseId: true } });
        if (!lesson) {
            return res.status(404).json({ error: 'Lesson for asset not found' });
        }
        // Verify instructor owns course
        const course = await prisma.course.findUnique({ where: { id: lesson.courseId }, select: { instructorId: true } });
        const authClerkId = req.auth().userId;
        const instructor = await prisma.user.findUnique({ where: { clerkId: authClerkId }, select: { id: true } });
        if (!instructor || instructor.id !== course.instructorId) {
            return res.status(403).json({ error: 'Not course instructor' });
        }
        await mux.video.assets.delete(assetId);
        // Clear lesson fields
        await prisma.lesson.update({ where: { id: lesson.id }, data: { muxAssetId: null, muxPlaybackId: null } });
        res.json({ success: true });
    } catch (error) {
        console.error('Mux delete error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
