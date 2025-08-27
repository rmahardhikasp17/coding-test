import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Edit, Star, Package, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useProductStore } from "../stores";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { currentProduct, isLoading, fetchProductById, clearCurrentProduct } = useProductStore();

  useEffect(() => {
    if (id) {
      fetchProductById(Number(id));
    }

    return () => clearCurrentProduct();
  }, [id, fetchProductById, clearCurrentProduct]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentProduct && !isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Product not found</p>
        <Link to="/currentProducts">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/currentProducts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Product Details</h1>
        </div>
        <Link to={`/currentProducts/${currentProduct.id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <img
                src={currentProduct.thumbnail}
                alt={currentProduct.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="grid grid-cols-3 gap-2">
                {currentProduct.images.slice(0, 3).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${currentProduct.title} ${index + 1}`}
                    className="w-full h-20 object-cover rounded-md"
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{currentProduct.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{currentProduct.category}</Badge>
              <Badge variant="outline">{currentProduct.brand}</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(currentProduct.price)}
              </span>
              {currentProduct.discountPercentage > 0 && (
                <Badge variant="destructive">
                  -{currentProduct.discountPercentage}%
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{currentProduct.rating}/5</span>
              <span className="text-muted-foreground">
                ({currentProduct.reviews.length} reviews)
              </span>
            </div>
            
            <p className="text-muted-foreground">{currentProduct.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span>Stock: {currentProduct.stock}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">SKU:</span>
                <span>{currentProduct.sku}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Weight:</span>
                <p>{currentProduct.weight}g</p>
              </div>
              <div>
                <span className="text-muted-foreground">Dimensions:</span>
                <p>
                  {currentProduct.dimensions.width} × {currentProduct.dimensions.height} × {currentProduct.dimensions.depth} cm
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Min Order:</span>
                <p>{currentProduct.minimumOrderQuantity}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p>{currentProduct.availabilityStatus}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">Warranty</p>
                  <p className="text-sm text-muted-foreground">{currentProduct.warrantyInformation}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">Shipping</p>
                  <p className="text-sm text-muted-foreground">{currentProduct.shippingInformation}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentProduct.reviews.slice(0, 3).map((review, index) => (
                <div key={index} className="border-b pb-3 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{review.reviewerName}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(review.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
