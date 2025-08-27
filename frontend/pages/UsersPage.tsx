import { useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { DataTable } from "../components/DataTable";
import { Pagination } from "../components/Pagination";
import { SearchInput } from "../components/SearchInput";
import { useUserStore } from "../stores";
import type { User } from "../types/api";

export function UsersPage() {
  const { toast } = useToast();

  const {
    users,
    currentPage,
    totalPages,
    filters,
    isLoading,
    fetchUsers,
    setFilters,
    setCurrentPage,
  } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Get filter & sortable options from service
  const filterOptions = {
    gender: ['male', 'female'],
    role: ['admin', 'moderator', 'user'],
    eyeColor: ['Brown', 'Blue', 'Green', 'Gray', 'Amber', 'Hazel'],
  };

  const sortableFields = [
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'email', label: 'Email' },
    { value: 'age', label: 'Age' },
  ];

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, [setCurrentPage]);

  const handleSearchChange = useCallback((value: string) => {
    setFilters({ search: value });
  }, [setFilters]);

  const handleSortChange = useCallback((value: string) => {
    setFilters({ sortBy: value === "none" ? "" : value });
  }, [setFilters]);

  const handleOrderChange = useCallback((value: "asc" | "desc") => {
    setFilters({ order: value });
  }, [setFilters]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    if (key === "none") {
      setFilters({ gender: "", role: "", eyeColor: "" });
    } else {
      setFilters({ [key]: value, search: "" }); // Clear search when filtering
    }
  }, [setFilters]);

  const columns = useMemo(
    () => [
      {
        key: "id",
        header: "ID",
      },
      {
        key: "firstName",
        header: "First Name",
      },
      {
        key: "lastName",
        header: "Last Name",
      },
      {
        key: "email",
        header: "Email",
      },
      {
        key: "phone",
        header: "Phone",
      },
      {
        key: "age",
        header: "Age",
      },
      {
        key: "gender",
        header: "Gender",
      },
      {
        key: "role",
        header: "Role",
        render: (user: User) => (
          <span className="capitalize">{user.role}</span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (user: User) => (
          <Link to={`/users/${user.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        ),
      },
    ],
    []
  );


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users</h1>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search users..."
          />
        </div>

        <Select
          value={
            filters.gender ? `gender:${filters.gender}` :
            filters.role ? `role:${filters.role}` :
            filters.eyeColor ? `eyeColor:${filters.eyeColor}` :
            "none"
          }
          onValueChange={(value) => {
            if (value === "none") {
              handleFilterChange("none", "");
            } else {
              const [key, val] = value.split(":");
              handleFilterChange(key, val);
            }
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No filter</SelectItem>
            {Object.entries(filterOptions).map(([key, values]) =>
              values.map((value) => (
                <SelectItem key={`${key}:${value}`} value={`${key}:${value}`}>
                  {key}: {value}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Select value={filters.sortBy || "none"} onValueChange={handleSortChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No sorting</SelectItem>
            {sortableFields.map((field) => (
              <SelectItem key={field.value} value={field.value}>
                {field.label}
              </SelectItem>
            ))}
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

      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No users found"
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
