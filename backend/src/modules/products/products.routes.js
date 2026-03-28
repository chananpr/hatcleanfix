const router = require("express").Router()
const ctrl = require("./products.controller")
const { authMiddleware } = require("../../middlewares/auth.middleware")
const { uploadProductImages } = require("../../middlewares/upload.middleware")

router.use(authMiddleware)

router.get("/summary", ctrl.summary)
router.get("/", ctrl.list)
router.get("/:id", ctrl.getOne)
router.post("/", uploadProductImages, ctrl.create)
router.put("/:id", uploadProductImages, ctrl.update)
router.delete("/:id", ctrl.remove)
router.post("/:id/toggle", ctrl.toggleActive)
router.post("/:id/delete-image", ctrl.deleteImage)

module.exports = router
