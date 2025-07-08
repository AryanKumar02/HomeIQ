import React from 'react'
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  CircularProgress,
  Backdrop,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import Card from '../basic/Card'

interface PropertyImage {
  url: string
  caption: string
  isPrimary: boolean
  uploadedAt: string
  file?: File
  uploading?: boolean
}

interface ImageUploadSectionProps {
  images: PropertyImage[]
  onImageAdd: (file: File) => void
  onImageRemove: (index: number) => void
  onSetPrimary: (index: number) => void
  onCaptionUpdate: (index: number, caption: string) => void
  textFieldStyles: object
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  images,
  onImageAdd,
  onImageRemove,
  onSetPrimary,
  onCaptionUpdate,
  textFieldStyles,
}) => {
  const theme = useTheme()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      void Promise.all(
        Array.from(files)
          .filter((file): file is File => file instanceof File && file.type.startsWith('image/'))
          .map((file) => onImageAdd(file))
      )
    }
    // Reset the input value so the same file can be uploaded again if needed
    event.target.value = ''
  }

  return (
    <Card
      title="Property Images"
      subtitle="Upload and manage property photos"
      padding={{ xs: 3, sm: 4, md: 5 }}
      marginBottom={4}
    >
      {/* Upload Section */}
      <Box sx={{ mb: 4 }}>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="image-upload-input"
        />
        <label htmlFor="image-upload-input">
          <Button
            component="span"
            variant="outlined"
            sx={{
              borderColor: theme.palette.secondary.main,
              color: theme.palette.secondary.main,
              borderStyle: 'dashed',
              borderWidth: '2px',
              p: 3,
              width: '100%',
              height: '120px',
              fontSize: '1rem',
              fontWeight: 500,
              flexDirection: 'column',
              gap: 1,
              '&:hover': {
                borderColor: theme.palette.secondary.main,
                backgroundColor: `${theme.palette.secondary.main}10`,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudUploadIcon />
              <span>Click to upload images or drag and drop</span>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Supports JPG, PNG, WEBP (Max 10MB each)
            </Typography>
          </Button>
        </label>
      </Box>

      {/* Images Grid */}
      {images.length > 0 && (
        <Grid container spacing={3}>
          {images.map((image, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: image.isPrimary
                    ? `3px solid ${theme.palette.secondary.main}`
                    : '1px solid #e0e3e7',
                  backgroundColor: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                {/* Primary Badge */}
                {image.isPrimary && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      backgroundColor: theme.palette.secondary.main,
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      zIndex: 2,
                    }}
                  >
                    PRIMARY
                  </Box>
                )}

                {/* Action Buttons */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 1,
                    zIndex: 2,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => onSetPrimary(index)}
                    disabled={image.uploading}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: image.isPrimary ? theme.palette.secondary.main : 'grey.500',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                      },
                      '&:focus': {
                        outline: 'none',
                      },
                      '&:disabled': {
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        color: 'grey.400',
                      },
                    }}
                  >
                    {image.isPrimary ? <StarIcon /> : <StarBorderIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onImageRemove(index)}
                    disabled={image.uploading}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: 'error.main',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                      },
                      '&:focus': {
                        outline: 'none',
                      },
                      '&:disabled': {
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        color: 'grey.400',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                {/* Image */}
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={image.url}
                    alt={image.caption || `Property image ${index + 1}`}
                    sx={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      display: 'block',
                      opacity: image.uploading ? 0.5 : 1,
                      transition: 'opacity 0.3s ease',
                    }}
                  />

                  {/* Upload Progress Overlay */}
                  {image.uploading && (
                    <Backdrop
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      open={true}
                    >
                      <CircularProgress size={40} sx={{ color: 'white', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                        Uploading...
                      </Typography>
                    </Backdrop>
                  )}
                </Box>

                {/* Caption Input */}
                <Box sx={{ p: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Caption"
                    value={image.caption}
                    onChange={(e) => onCaptionUpdate(index, e.target.value)}
                    placeholder="Add a caption..."
                    variant="outlined"
                    sx={{
                      ...textFieldStyles,
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.875rem',
                      },
                    }}
                    slotProps={{
                      htmlInput: { maxLength: 200 },
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: 'text.secondary',
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
          <Typography variant="body1" sx={{ mb: 1 }}>
            No images uploaded yet
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Upload photos to showcase your property
          </Typography>
        </Box>
      )}
    </Card>
  )
}

export default ImageUploadSection
