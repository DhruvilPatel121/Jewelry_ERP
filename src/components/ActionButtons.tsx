import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Download, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActionButtonsProps {
  type: 'sale' | 'purchase' | 'payment';
  id: string;
  onEdit?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  size?: 'sm' | 'default';
  className?: string;
}

export default function ActionButtons({ 
  type, 
  id, 
  onEdit, 
  onDownload, 
  onDelete, 
  size = 'sm',
  className = '' 
}: ActionButtonsProps) {
  const navigate = useNavigate();
  
  // Size configurations
  const buttonSize = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      const editRoute = type === 'sale' ? '/new-sale' : 
                       type === 'purchase' ? '/new-purchase' : 
                       '/new-payment';
      navigate(`${editRoute}?edit=${id}`);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Navigate to invoice page for PDF download (like sales and purchases)
      const invoiceRoute = type === 'sale' ? `/invoice/sale/${id}` : 
                          type === 'purchase' ? `/invoice/purchase/${id}` : 
                          `/invoice/payment/${id}`;
      window.open(invoiceRoute, '_blank');
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Edit Button */}
      <Button
        variant="ghost"
        size="icon"
        className={buttonSize}
        onClick={handleEdit}
        title={`Edit ${type}`}
      >
        <Edit className={iconSize} />
      </Button>

      {/* Download Button */}
      <Button
        variant="ghost"
        size="icon"
        className={buttonSize}
        onClick={handleDownload}
        title={`Download ${type} invoice`}
      >
        <Download className={iconSize} />
      </Button>

      {/* Delete Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`${buttonSize} text-destructive hover:text-destructive`}
            title={`Delete ${type}`}
          >
            <Trash2 className={iconSize} />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {type.charAt(0).toUpperCase() + type.slice(1)}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {type} transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
