import * as yup from "yup"

const email = yup.string().required().email("Invalid email")

const name = yup
  .string()
  .required("Name is required")
  .min(5, "Should be minimum 5 characters")

const password = yup.string().required().min(5)

const userType = yup
  .mixed()
  .oneOf(["Buyer", "Seller"], "Wrong entry")
  .required("User type is required")

const role = yup
  .mixed()
  .oneOf(["admin", "buyer", "seller"], "Wrong entry")
  .required("User role is required")

const country = yup
  .string()
  .required("Country is required")
  .min(3, "Min 3 characters")

export const UserRegistrationRules = yup.object().shape({
  email,
  name,
  password,
  country,
})

export const UserAuthenticationRules = yup.object().shape({
  email,
  password,
})

export const UserRoleRules = yup.object().shape({
  role,
  userType,
})
