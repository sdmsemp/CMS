import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Avatar,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  Description,
  Send,
  AttachFile,
  Business,
  PriorityHigh
} from '@mui/icons-material';

const ComplaintForm = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    department: '',
    priority: 'medium',
    attachments: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add your submit logic here
      setSuccess('Complaint submitted successfully!');
      setForm({
        title: '',
        description: '',
        department: '',
        priority: 'medium',
        attachments: []
      });
    } catch (err) {
      setError(err.message || 'Failed to submit complaint');
    }
  };

  return (
    <Container maxWidth="md">
      <Box py={3}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <Description />
            </Avatar>
            <Typography variant="h5">Submit Complaint</Typography>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="Brief description of the issue"
                helperText="Keep it short and descriptive"
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                placeholder="Provide detailed information about your complaint"
                helperText="Include any relevant details that might help resolve the issue"
              />

              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={form.department}
                  label="Department"
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  startAdornment={
                    <InputAdornment position="start">
                      <Business color="action" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="it">IT Department</MenuItem>
                  <MenuItem value="hr">HR Department</MenuItem>
                  <MenuItem value="finance">Finance Department</MenuItem>
                  <MenuItem value="facilities">Facilities</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={form.priority}
                  label="Priority"
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  startAdornment={
                    <InputAdornment position="start">
                      <PriorityHigh color="action" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="low">
                    <Chip size="small" label="Low" color="default" />
                  </MenuItem>
                  <MenuItem value="medium">
                    <Chip size="small" label="Medium" color="warning" />
                  </MenuItem>
                  <MenuItem value="high">
                    <Chip size="small" label="High" color="error" />
                  </MenuItem>
                </Select>
              </FormControl>

              <Box>
                <input
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  id="complaint-attachments"
                  onChange={(e) => {
                    setForm({
                      ...form,
                      attachments: [...form.attachments, ...e.target.files]
                    });
                  }}
                />
                <label htmlFor="complaint-attachments">
                  <Button
                    component="span"
                    startIcon={<AttachFile />}
                    variant="outlined"
                  >
                    Add Attachments
                  </Button>
                </label>
                {form.attachments.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Attachments:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {form.attachments.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() => {
                            const newAttachments = form.attachments.filter(
                              (_, i) => i !== index
                            );
                            setForm({ ...form, attachments: newAttachments });
                          }}
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<Send />}
              >
                Submit Complaint
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ComplaintForm;
