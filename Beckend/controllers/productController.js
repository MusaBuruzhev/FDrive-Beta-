const Product = require("../models/Product");
const User = require("../models/User");

class ProductController {
  async addProduct(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (
        !user.name ||
        !user.surname ||
        !user.phone ||
        !user.citizenship ||
        user.passportFiles.length === 0
      ) {
        return res.status(400).json({ message: "Профиль пользователя заполнен не полностью" });
      }

      if (!user.documentsVerified) {
        return res.status(403).json({ message: "Ваши документы ещё не проверены админом" });
      }

      let imagePaths = '';

      if (req.files && req.files.length > 0) {
        imagePaths = req.files.map(file => file.path).join(' , ');
      } else {
        imagePaths = "uploads/no_img.png";
      }

      const {
        name,
        description,
        price,
        carModel,
        carYear,
        carColor,
        carTransmission,
        carFuelType,
        carSeats,
        carLuggage,
        canDeliver,
        address
      } = req.body;

      const product = new Product({
        name,
        description,
        price: Number(price),
        carModel,
        carYear: Number(carYear),
        carColor,
        carTransmission,
        carFuelType,
        carSeats: Number(carSeats),
        carLuggage: Number(carLuggage),
        canDeliver: canDeliver === 'true' || canDeliver === true,
        address,
        image: imagePaths,
        owner: userId,
      });

      await product.save();

      return res.status(200).json({ message: "Машина успешно добавлена!", product });
    } catch (e) {
      console.error('Ошибка добавления машины:', e);
      return res.status(500).json({ message: "Ошибка добавления машины", error: e.message });
    }
  }

  async getProducts(req, res) {
    try {
      const { from, to } = req.query;
      let query = {};

      if (from && to) {
        const startDate = new Date(from);
        const endDate = new Date(to);

        query = {
          rentalPeriods: {
            $not: {
              $elemMatch: {
                startDate: { $lte: endDate },
                endDate: { $gte: startDate }
              }
            }
          }
        };
      }

      const products = await Product.find(query);
      return res.json(products);
    } catch (e) {
      console.error('Ошибка получения продуктов:', e);
      return res.status(500).json({ message: "Ошибка получения продуктов", error: e.message });
    }
  }

  async getOneProduct(req, res) {
    try {
      const id = req.params.id;
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: "Продукт не найден" });
      }
      return res.json(product);
    } catch (e) {
      console.error('Ошибка получения продукта:', e);
      return res.status(500).json({ message: "Ошибка получения продукта", error: e.message });
    }
  }

  async updateProduct(req, res) {
    try {
      const productId = req.params.id;
      console.log('Обновление продукта:', productId, 'Body:', req.body, 'Files:', req.files);

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Машина не найдена" });
      }

      const userId = req.user.id;
      const user = await User.findById(userId);
      if (user.roles[0] !== "ADMIN" && product.owner.toString() !== userId) {
        return res.status(403).json({ message: "Нет доступа" });
      }

      const {
        name,
        price,
        description,
        carModel,
        carYear,
        carColor,
        carTransmission,
        carFuelType,
        carSeats,
        carLuggage,
        canDeliver,
        address
      } = req.body;

      let imagePaths = product.image; // Сохраняем текущие изображения, если новые не загружены

      if (req.files && req.files.length > 0) {
        imagePaths = req.files.map(file => file.path).join(' , ');
      }

      const updateData = {
        name: name || product.name,
        price: price ? Number(price) : product.price,
        description: description || product.description,
        carModel: carModel || product.carModel,
        carYear: carYear ? Number(carYear) : product.carYear,
        carColor: carColor || product.carColor,
        carTransmission: carTransmission || product.carTransmission,
        carFuelType: carFuelType || product.carFuelType,
        carSeats: carSeats ? Number(carSeats) : product.carSeats,
        carLuggage: carLuggage ? Number(carLuggage) : product.carLuggage,
        canDeliver: canDeliver !== undefined ? (canDeliver === 'true' || canDeliver === true) : product.canDeliver,
        address: address || product.address,
        image: imagePaths
      };

      console.log('Данные для обновления:', updateData);

      const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true });
      if (!updatedProduct) {
        return res.status(404).json({ message: "Не удалось обновить машину" });
      }

      return res.status(200).json({ message: "Машина обновлена!", product: updatedProduct });
    } catch (e) {
      console.error('Ошибка изменения машины:', e);
      return res.status(500).json({ message: "Ошибка изменения машины", error: e.message, stack: e.stack });
    }
  }

  async deleteOneProduct(req, res) {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Машина не найдена" });
      }

      const userId = req.user.id;
      const user = await User.findById(userId);

      if (user.roles[0] !== "ADMIN" && product.owner.toString() !== userId) {
        return res.status(403).json({ message: "Нет доступа" });
      }

      await Product.findByIdAndDelete(productId);
      return res.status(200).json({ message: "Машина удалена!" });
    } catch (e) {
      console.error('Ошибка удаления машины:', e);
      return res.status(500).json({ message: "Ошибка удаления машины", error: e.message });
    }
  }

  async getMyProducts(req, res) {
    try {
      const userId = req.user.id;
      const products = await Product.find({ owner: userId });
      return res.json(products);
    } catch (e) {
      console.error('Ошибка получения ваших машин:', e);
      return res.status(500).json({ message: "Ошибка получения ваших машин", error: e.message });
    }
  }
}

module.exports = new ProductController();