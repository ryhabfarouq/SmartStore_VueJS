const HomeService = require('../services/HomeService');

class HomeController {
  async getHomeData(req, res) {
    try {
      const data = await HomeService.getHomeData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching home data', error: error.message });
    }
  }
}

module.exports = new HomeController();
