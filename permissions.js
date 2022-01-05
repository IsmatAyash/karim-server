import { not, and, or, rule, shield, allow } from "graphql-shield"

function checkPermission(user, permission) {
  if (user && user["userInfo"]) {
    return user["userInfo"].permissions.includes(permission)
  }
  return false
}

function checkRole(user, role) {
  if (user && user["userInfo"]) {
    return user["userInfo"].role === role
  }
  return false
}

const isAuthenticated = rule()((parent, args, { user }) => {
  console.log("ISAUTH", user !== null)
  return Math.floor(Date.now() / 1000) < user.exp && user !== null
})

const isAdmin = rule()((parent, args, { user }) => {
  console.log("ADMIN", checkRole(user, "admin"))
  return checkRole(user, "admin")
})

const isSeller = rule()((parent, args, { user }) => {
  console.log("SELLER", checkRole(user, "seller"))
  return checkRole(user, "seller")
})

const canReadAnyUser = rule()((parent, args, { user }) => {
  return checkPermission(user, "read:any_user")
})

const canReadOwnUser = rule()((parent, args, { user }) => {
  console.log("CANREADOWN", checkPermission(user, "read:own_user"))
  return checkPermission(user, "read:own_user")
})

const isReadingOwnUser = rule()((parent, { userId }, { user }) => {
  console.log("ISREADINGOWNUSR", user && user.sub === userId)
  return user && user.sub === userId
})

const isReadingOwnProduct = rule()((parent, args, { user }) => {
  const { sellerId } = args.updatedProduct || args.shipDet
  console.log("IS READING OWN PROD", user && user.sub === sellerId)
  return user && user.sub === sellerId
})

export default shield(
  {
    Query: {
      users: or(isAdmin, isSeller, and(isReadingOwnUser, canReadOwnUser)),
      sellers: isAdmin,
      getUser: or(isAdmin, isSeller, and(isReadingOwnUser, canReadOwnUser)),
      carts: isAdmin,
      getCart: or(isAdmin, and(isReadingOwnUser, canReadOwnUser)),
      orders: or(isAdmin, and(isReadingOwnUser, canReadOwnUser)),
      getOrder: or(isAdmin, and(isReadingOwnUser, canReadOwnUser)),
      ordersByStatus: isAdmin,
      orderedProductsByStatus: isAdmin,
      orderedProductsBySeller: or(
        isAdmin,
        and(isReadingOwnUser, canReadOwnUser)
      ),
    },
    Mutation: {
      editUserById: or(isAdmin, and(canReadOwnUser, isReadingOwnUser)),
      createProduct: or(isSeller, isAdmin),
      delProductById: isAdmin,
      editProductById: or(
        isAdmin,
        and(canReadOwnUser, isReadingOwnProduct, isSeller)
      ),
      addCartItem: isAuthenticated,
      updCartItem: isAuthenticated,
      delCartItem: isAuthenticated,
      delCart: isAuthenticated,
      addOrder: isAuthenticated,
      shipit: or(isAdmin, and(canReadOwnUser, isReadingOwnProduct, isSeller)),
    },
  },
  {
    allowExternalErrors: true,
  }
)
