const router = require("express").Router()
const ctrl = require("./user.controller")
const { authMiddleware, requireRole } = require("../../middlewares/auth.middleware")

router.use(authMiddleware)

// Profile routes (current user) — must be before /:id
router.get("/me/profile", ctrl.getMyProfile)
router.put("/me/profile", ctrl.updateMyProfile)
router.put("/me/password", ctrl.changePassword)
router.put("/me/facebook", ctrl.linkFacebook)

router.get("/roles", ctrl.listRoles)
router.get("/", requireRole("superadmin", "admin"), ctrl.list)
router.get("/:id", requireRole("superadmin", "admin"), ctrl.get)
router.post("/", requireRole("superadmin"), ctrl.create)
router.put("/:id", requireRole("superadmin"), ctrl.update)
router.delete("/:id", requireRole("superadmin"), ctrl.remove)

module.exports = router
