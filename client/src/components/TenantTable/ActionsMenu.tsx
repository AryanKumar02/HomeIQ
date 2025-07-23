import React, { useState } from 'react'
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import type { ActionsMenuProps } from '../../types/tenantTable'

/**
 * ActionsMenu component provides a dropdown menu with tenant-specific actions
 * Includes View and Edit options with proper accessibility features
 *
 * @param props - Component props
 * @returns Actions menu component
 */
const ActionsMenu: React.FC<ActionsMenuProps> = ({
  tenantId,
  onView,
  onEdit,
  onDelete
}) => {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // Prevent event bubbling to avoid triggering row click
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleView = (event: React.MouseEvent) => {
    event.stopPropagation()
    handleClose()
    onView(tenantId)
  }

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation()
    handleClose()
    onEdit(tenantId)
  }

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation()
    handleClose()
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    setDeleteDialogOpen(false)
    try {
      if (typeof onDelete === 'function') {



        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        onDelete(tenantId)
      }
    } catch (error: unknown) {
      console.error('Error in delete handler:', error)
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
  }

  return (
    <>
      <Tooltip title="Tenant actions" arrow>
        <IconButton
          aria-label={`Actions for tenant ${tenantId}`}
          aria-controls={open ? 'tenant-actions-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          size="small"
          sx={{
            color: theme.palette.grey[600],
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              color: theme.palette.primary.main,
              transform: 'translateY(-1px)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            },
            '&:focus': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
            }
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        id="tenant-actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          root: {
            'aria-labelledby': `Actions for tenant ${tenantId}`,
            role: 'menu'
          },
          paper: {
            sx: {
              minWidth: 160,
              borderRadius: 2,
              mt: 1,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              '& .MuiMenuItem-root': {
                borderRadius: 1,
                mx: 1,
                my: 0.5,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  transform: 'translateX(4px)',
                },
                '&:focus': {
                  backgroundColor: theme.palette.action.focus,
                }
              }
            }
          }
        }}
      >
        <MenuItem
          onClick={handleView}
          role="menuitem"
          aria-label={`View details for tenant ${tenantId}`}
        >
          <ListItemIcon>
            <ViewIcon
              fontSize="small"
              sx={{ color: theme.palette.primary.main }}
            />
          </ListItemIcon>
          <ListItemText>
            View Details
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={handleEdit}
          role="menuitem"
          aria-label={`Edit tenant ${tenantId}`}
        >
          <ListItemIcon>
            <EditIcon
              fontSize="small"
              sx={{ color: theme.palette.secondary.main }}
            />
          </ListItemIcon>
          <ListItemText>
            Edit Tenant
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={handleDelete}
          role="menuitem"
          aria-label={`Delete tenant ${tenantId}`}
        >
          <ListItemIcon>
            <DeleteIcon
              fontSize="small"
              sx={{ color: theme.palette.error.main }}
            />
          </ListItemIcon>
          <ListItemText>
            Delete Tenant
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Tenant
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this tenant? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ActionsMenu
