const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

const CampaignAssetsController = {
  // Upload assets (purchase order or completion photos)
  async upload(req, res) {
    try {
      const { campaignId, type } = req.body;
      if (!campaignId || !type) {
        return res.status(400).json({ error: 'campaignId and type are required' });
      }
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      // Validate type
      if (!['PURCHASE_ORDER', 'COMPLETION_PHOTO'].includes(type)) {
        return res.status(400).json({ error: 'Invalid asset type' });
      }

      // If it's PURCHASE_ORDER → ensure only one is allowed
      if (type === 'PURCHASE_ORDER') {
        const existingPO = await prisma.campaignAssets.findFirst({
          where: { campaignId: Number(campaignId), type: 'PURCHASE_ORDER' },
        });
        if (existingPO) {
          return res.status(400).json({ error: 'Purchase order already uploaded' });
        }
      }

      const assets = await Promise.all(
        req.files.map(async (file) => {
          return prisma.campaignAssets.create({
            data: {
              campaignId: Number(campaignId),
              type,
              fileUrl: file.path.replace(/\\/g, '/'),
              uploadedAt: new Date(),
              uploadedById: req.user.id, // ✅ store uploader
            },
          });
        })
      );

      res.status(201).json(assets);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all assets for a campaign and optional type
  async getByCampaign(req, res) {
    try {
      const { campaignId, type } = req.query;
      if (!campaignId) {
        return res.status(400).json({ error: 'campaignId is required' });
      }
      const where = { campaignId: Number(campaignId) };
      if (type) where.type = type;

      const assets = await prisma.campaignAssets.findMany({
        where,
        include: { uploadedBy: true }, // ✅ include user info
        orderBy: { uploadedAt: 'desc' },
      });
      res.json(assets);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete asset
  async delete(req, res) {
    try {
      const { id } = req.params;
      const asset = await prisma.campaignAssets.findUnique({
        where: { id: Number(id) },
      });
      if (!asset) return res.status(404).json({ error: 'Asset not found' });

      // Delete file from disk
      if (asset.fileUrl && fs.existsSync(asset.fileUrl)) {
        fs.unlinkSync(asset.fileUrl);
      }

      await prisma.campaignAssets.delete({ where: { id: Number(id) } });
      res.json({ message: 'Asset deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = CampaignAssetsController;
