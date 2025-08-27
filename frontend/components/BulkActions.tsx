import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "./LoadingSpinner";

interface BulkActionsProps {
  selectedCount: number;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function BulkActions({ selectedCount, onDelete, isDeleting = false }: BulkActionsProps) {
  return (
    <Card className="bg-muted/50">
      <CardContent className="flex items-center justify-between p-4">
        <span className="text-sm font-medium">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </span>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <LoadingSpinner />
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
