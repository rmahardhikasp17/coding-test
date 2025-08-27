import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ImageUpload } from "../components/ImageUpload";
import { useProductStore } from "../stores";
import type { ProductCreateRequest, ProductUpdateRequest } from "../types/api";

interface FormData extends ProductCreateRequest {
  id?: number;
  stock?: number;
  sku?: string;
  weight?: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  images?: string[];
}

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;

  const {
    currentProduct,
    categories,
    isLoading,
    isCreating,
    isUpdating,
    fetchProductById,
    fetchCategories,
    createProduct,
    updateProduct,
    clearCurrentProduct,
  } = useProductStore();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    price: 0,
    stock: 0,
    brand: "",
    sku: "",
    weight: 0,
    dimensions: { width: 0, height: 0, depth: 0 },
    warrantyInformation: "",
    shippingInformation: "",
    availabilityStatus: "In Stock",
    returnPolicy: "",
    minimumOrderQuantity: 1,
    thumbnail: "",
    images: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();

    if (isEdit && id) {
      fetchProductById(Number(id));
    } else {
      clearCurrentProduct();
    }
  }, [isEdit, id, fetchProductById, fetchCategories, clearCurrentProduct]);

  useEffect(() => {
    if (currentProduct && isEdit) {
      setFormData({
        title: currentProduct.title,
        description: currentProduct.description,
        category: currentProduct.category,
        price: currentProduct.price,
        stock: currentProduct.stock,
        brand: currentProduct.brand || "",
        sku: currentProduct.sku || "",
        weight: currentProduct.weight || 0,
        dimensions: currentProduct.dimensions || { width: 0, height: 0, depth: 0 },
        warrantyInformation: currentProduct.warrantyInformation || "",
        shippingInformation: currentProduct.shippingInformation || "",
        availabilityStatus: currentProduct.availabilityStatus || "In Stock",
        returnPolicy: currentProduct.returnPolicy || "",
        minimumOrderQuantity: currentProduct.minimumOrderQuantity || 1,
        thumbnail: currentProduct.thumbnail || "",
        images: currentProduct.images || [],
      });
    }
  }, [currentProduct, isEdit]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!formData.title?.trim()) newErrors.title = "Title is required";
    if (!formData.description?.trim()) newErrors.description = "Description is required";
    if (!formData.category?.trim()) newErrors.category = "Category is required";
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0";
    if (formData.stock !== undefined && formData.stock < 0) newErrors.stock = "Stock cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isEdit && id) {
        await updateProduct({ ...formData, id: Number(id) });
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        await createProduct(formData);
        toast({ title: "Success", description: "Product created successfully" });
      }
      navigate("/products");
    } catch (error) {
      toast({
        title: "Error",
        description: isEdit ? "Failed to update product" : "Failed to create product",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleDimensionChange = (dimension: keyof FormData["dimensions"], value: number) => {
    setFormData(prev => ({ ...prev, dimensions: { ...prev.dimensions, [dimension]: value } }));
  };

  const handleImageAdd = (url: string) => {
    setFormData(prev => ({ ...prev, images: [...(prev.images || []), url] }));
  };

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== index) || [] }));
  };

  if (isEdit && isLoading) {
    return <div className="flex justify-center py-8"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{isEdit ? "Edit Product" : "Add Product"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className={errors.description ? "border-destructive" : ""}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", Number(e.target.value))}
                    className={errors.price ? "border-destructive" : ""}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange("stock", Number(e.target.value))}
                    className={errors.stock ? "border-destructive" : ""}
                  />
                  {errors.stock && (
                    <p className="text-sm text-destructive">{errors.stock}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (g)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Dimensions (cm)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Width"
                    type="number"
                    min="0"
                    value={formData.dimensions.width}
                    onChange={(e) => handleDimensionChange("width", Number(e.target.value))}
                  />
                  <Input
                    placeholder="Height"
                    type="number"
                    min="0"
                    value={formData.dimensions.height}
                    onChange={(e) => handleDimensionChange("height", Number(e.target.value))}
                  />
                  <Input
                    placeholder="Depth"
                    type="number"
                    min="0"
                    value={formData.dimensions.depth}
                    onChange={(e) => handleDimensionChange("depth", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minOrder">Minimum Order Quantity</Label>
                <Input
                  id="minOrder"
                  type="number"
                  min="1"
                  value={formData.minimumOrderQuantity}
                  onChange={(e) => handleInputChange("minimumOrderQuantity", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability Status</Label>
                <Select
                  value={formData.availabilityStatus}
                  onValueChange={(value) => handleInputChange("availabilityStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                label="Thumbnail Image"
                value={formData.thumbnail}
                onChange={(url) => handleInputChange("thumbnail", url)}
              />

              <div className="space-y-4">
                <Label>Additional Images</Label>
                {formData.images && formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => handleImageRemove(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <ImageUpload
                  label="Add Image"
                  value=""
                  onChange={handleImageAdd}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warranty">Warranty Information</Label>
                  <Textarea
                    id="warranty"
                    value={formData.warrantyInformation}
                    onChange={(e) => handleInputChange("warrantyInformation", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipping">Shipping Information</Label>
                  <Textarea
                    id="shipping"
                    value={formData.shippingInformation}
                    onChange={(e) => handleInputChange("shippingInformation", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnPolicy">Return Policy</Label>
                <Textarea
                  id="returnPolicy"
                  value={formData.returnPolicy}
                  onChange={(e) => handleInputChange("returnPolicy", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isCreating || isUpdating}
          >
            {(isCreating || isUpdating) ? (
              <LoadingSpinner />
            ) : (
              isEdit ? "Update Product" : "Create Product"
            )}
          </Button>
          <Link to="/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
