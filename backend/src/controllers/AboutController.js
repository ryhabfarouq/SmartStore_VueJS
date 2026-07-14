const AboutService = require('../services/AboutService');

class AboutController {
  async getAboutData(req, res) {
    try {
      const data = await AboutService.getAboutData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching about data', error: error.message });
    }
  }
}

module.exports = new AboutController();
