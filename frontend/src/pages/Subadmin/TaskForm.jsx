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
  Grid,
  Stack,
  Chip,
  Avatar,
  IconButton,
  Alert,
  Autocomplete,
  InputAdornment,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import {
  Assignment,
  Send,
  AttachFile,
  AddAlarm,
  Person,
  Delete,
  Schedule,
  PriorityHigh
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';

const TaskForm = () => {
  const [task, setTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: null,
    assignees: [],
    attachments: [],
    notifications: true,
    status: 'pending'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sample data - replace with your actual data
  const users = [
    { id: 1, name: 'John Doe', department: 'IT' },
    { id: 2, name: 'Jane Smith', department: 'HR' },
    // Add more users...
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add your submit logic here
      setSuccess('Task created successfully!');
      setTask({
        title: '',
        description: '',
        priority: 'medium',
        deadline: null,
        assignees: [],
        attachments: [],
        notifications: true,
        status: 'pending'
      });
    } catch (err) {
      setError(err.message || 'Failed to create task');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box py={3}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <Assignment />
            </Avatar>
            <Typography variant="h5">Create Task</Typography>
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
                label="Task Title"
                value={task.title}
                onChange={(e) => setTask({ ...task, title: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Assignment color="action" />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={task.description}
                onChange={(e) => setTask({ ...task, description: e.target.value })}
                required
              />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={task.priority}
                      label="Priority"
                      onChange={(e) => setTask({ ...task, priority: e.target.value })}
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
                </Grid>

                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Deadline"
                    value={task.deadline}
                    onChange={(newValue) => setTask({ ...task, deadline: newValue })}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <Schedule color="action" />
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Autocomplete
                multiple
                options={users}
                getOptionLabel={(option) => option.name}
                value={task.assignees}
                onChange={(_, newValue) => setTask({ ...task, assignees: newValue })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assign To"
                    placeholder="Select team members"
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      avatar={<Avatar>{option.name[0]}</Avatar>}
                      label={`${option.name} (${option.department})`}
                      {...getTagProps({ index })}
                      size="small"
                    />
                  ))
                }
              />

              <Box>
                <input
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  id="task-attachments"
                  onChange={(e) => {
                    setTask({
                      ...task,
                      attachments: [...task.attachments, ...e.target.files]
                    });
                  }}
                />
                <label htmlFor="task-attachments">
                  <Button
                    component="span"
                    startIcon={<AttachFile />}
                    variant="outlined"
                  >
                    Add Attachments
                  </Button>
                </label>
                {task.attachments.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Attachments:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {task.attachments.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() => {
                            const newAttachments = task.attachments.filter(
                              (_, i) => i !== index
                            );
                            setTask({ ...task, attachments: newAttachments });
                          }}
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={task.notifications}
                    onChange={(e) =>
                      setTask({ ...task, notifications: e.target.checked })
                    }
                  />
                }
                label="Enable notifications for this task"
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<Send />}
              >
                Create Task
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default TaskForm;
