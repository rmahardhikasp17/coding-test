import { useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Eye, Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { DataTable } from "../components/DataTable";
import { Pagination } from "../components/Pagination";
import { SearchInput } from "../components/SearchInput";
import { BulkActions } from "../components/BulkActions";
import { useProductStore } from "../stores";
import type { Product } from "../types/api";

export function ProductsPage() {
  const { toast } = useToast();

  const {
    products,
    categories,
    currentPage,
    totalPages,
    filters,
    isLoading,
    isDeleting,
    selectedProducts,
    fetchProducts,
    fetchCategories,
    deleteProduct,
    deleteMultipleProducts,
    setFilters,
    setCurrentPage,
    selectProduct,
    deselectProduct,
    selectAllProducts,
    clearSelection,
  } = useProductStore();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, [setCurrentPage]);

  const handleSearchChange = useCallback((value: string) => {
    setFilters({ search: value });
  }, [setFilters]);

  const handleCategoryChange = useCallback((value: string) => {
    setFilters({ category: value === "all" ? "" : value });
  }, [setFilters]);

  const handleSortChange = useCallback((value: string) => {
    setFilters({ sortBy: value === "none" ? "" : value });
  }, [setFilters]);

  const handleOrderChange = useCallback((value: "asc" | "desc") => {
    setFilters({ order: value });
  }, [setFilters]);

  const handleSelectProduct = useCallback((productId: number, checked: boolean) => {
    if (checked) {
      selectProduct(productId);
    } else {
      deselectProduct(productId);
    }
  }, [selectProduct, deselectProduct]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      selectAllProducts();
    } else {
      clearSelection();
    }
  }, [selectAllProducts, clearSelection]);

  const handleDeleteProduct = useCallback(async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive",
        });
      }
    }
  }, [deleteProduct, toast]);

  const handleBulkDelete = useCallback(async () => {
    if (confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        await deleteMultipleProducts(selectedProducts);
        toast({
          title: "Success",
          description: `${selectedProducts.length} products deleted successfully`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete products",
          variant: "destructive",
        });
      }
    }
  }, [selectedProducts, deleteMultipleProducts, toast]);

  const columns = useMemo(() => [
    {
      key: "select",
      header: "Select",
      render: () => (
        <Checkbox
          checked={selectedProducts.length === products.length && products.length > 0}
          onCheckedChange={handleSelectAll}
        />
      ),
    },
    {
      key: "thumbnail",
      header: "Image",
      render: (product: Product) => (
        <img
          src={product.thumbnail}
          alt={product.title}
          className="h-12 w-12 rounded-md object-cover"
        />
      ),
    },
    {
      key: "title",
      header: "Title",
    },
    {
      key: "category",
      header: "Category",
      render: (product: Product) => (
        <Badge variant="secondary">{product.category}</Badge>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (product: Product) => `$${product.price.toFixed(2)}`,
    },
    {
      key: "stock",
      header: "Stock",
    },
    {
      key: "rating",
      header: "Rating",
      render: (product: Product) => `${product.rating}/5`,
    },
    {
      key: "actions",
      header: "Actions",
      render: (product: Product) => (
        <div className="flex gap-2">
          <Checkbox
            checked={selectedProducts.includes(product.id)}
            onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
            className="mr-2"
          />
          <Link to={`/products/${product.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link to={`/products/${product.id}/edit`}>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteProduct(product.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], [selectedProducts, products, handleSelectAll, handleSelectProduct, handleDeleteProduct, isDeleting]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link to="/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search products..."
          />
        </div>

        <Select value={filters.category || "all"} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.sortBy || "none"} onValueChange={handleSortChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No sorting</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="stock">Stock</SelectItem>
            <SelectItem value="brand">Brand</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.order} onValueChange={handleOrderChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedProducts.length > 0 && (
        <BulkActions
          selectedCount={selectedProducts.length}
          onDelete={handleBulkDelete}
          isDeleting={isDeleting}
        />
      )}

      <DataTable
        data={products}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No products found"
      />

      <div className="flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
