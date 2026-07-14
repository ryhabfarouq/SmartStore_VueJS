class AboutService {
  async getAboutData() {
    return {
      title: "About Smart Store",
      paragraphs: [
        "Smart Store is a modern e-commerce platform designed to provide a simple, fast, and seamless online shopping experience.",

        "Our goal is to make discovering and purchasing products easier through a user-friendly interface, responsive design, and smooth navigation. Smart Store offers a wide range of products, powerful search and filtering features, secure authentication, cart management, and a streamlined checkout experience.",

        "Built with modern web technologies, Smart Store focuses on performance, scalability, and delivering a great experience across all devices.",
      ],
      promoImage: "/promo.png",
    };
  }
}

module.exports = new AboutService();
