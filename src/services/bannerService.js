export class BannerService {
  static getBanners() {
    return {
      intervalMs: 2000,
      slides: [
        {
          id: 1,
          title: "GETRAW 90s Banner",
          image: "/banner1.png",
          badge: "THXNSMN® BRANDED POCKET TAG",
          description: "Tampilan editorial kemeja garis-garis dengan saku berlabel THXNSMN®, siluet relaxed boxy fit."
        },
        {
          id: 2,
          title: "GETRAW Forever FTP Banner",
          image: "/banner2.png",
          badge: "FOREVER FTP EDITION",
          description: "Eksplorasi siluet streetwear oversized dengan grafis ikonik dan material katun heavyweight."
        },
        {
          id: 3,
          title: "GETRAW Graffiti Banner",
          image: "/banner3.png",
          badge: "SPECIAL DISCOUNT 50%",
          description: "Dapatkan t-shirt grafis pilihan dengan harga spesial mulai dari Rp 99,000."
        }
      ]
    };
  }
}
