import * as yup from "yup"

const title = yup.string().required()

const unit = yup
  .mixed()
  .oneOf(["gr", "kg", "box", "piece", "dozen"], "Wrong unit entry")
  .required("Unit is required")

const price = yup.number().required()
const oldPrice = yup.number()
const rating = yup.number()
const avgRating = yup.number()
const inventory = yup.number().required()

const image = yup.string().required()

const category = yup
  .mixed()
  .oneOf(["Veges", "Fruit"], "Wrong category entry")
  .required("Product category is required")

const featured = yup.boolean()

export const ProductRules = yup.object().shape({
  title,
  unit,
  price,
  image,
  oldPrice,
  rating,
  avgRating,
  featured,
  inventory,
  category,
})
