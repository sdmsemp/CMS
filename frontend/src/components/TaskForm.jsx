import { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Chip,
  IconButton,
  Grid,
  FormControlLabel,
  Switch,
  Autocomplete,
  Avatar
} from '@mui/material';
import { 
  Assignment,
  Send,
  AttachFile,
  AddAlarm,
  Person
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';

const TaskForm = ({ onSubmit }) => {
  const [task, setTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: null,
    assignees: [],
    attachments: [],
    notifications: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(task);
      setSuccess(true);
      setError('');
      setTask({
        title: '',
        description: '',
        priority: 'medium',
        deadline: null,
        assignees: [],
        attachments: [],
        notifications: true
      });
    } catch (err) {
      setError(err.message);
      setSuccess(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Assignment color="primary" />
        <Typography variant="h6">Create Task</Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Task Title"
            value={task.title}
            onChange={(e) => setTask({...task, title: e.target.value})}
            required
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={task.description}
            onChange={(e) => setTask({...task, description: e.target.value})}
            required
          />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={task.priority}
                  label="Priority"
                  onChange={(e) => setTask({...task, priority: e.target.value})}
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
                onChange={(newValue) => setTask({...task, deadline: newValue})}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Grid>
          </Grid>

          <Autocomplete
            multiple
            options={[]} // Add your users list here
            getOptionLabel={(option) => option.name}
            value={task.assignees}
            onChange={(_, newValue) => setTask({...task, assignees: newValue})}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Assign To"
                placeholder="Select team members"
                required
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  avatar={<Avatar>{option.name[0]}</Avatar>}
                  label={option.name}
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
                {task.attachments.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => {
                      const newAttachments = task.attachments.filter((_, i) => i !== index);
                      setTask({...task, attachments: newAttachments});
                    }}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            )}
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={task.notifications}
                onChange={(e) => setTask({...task, notifications: e.target.checked})}
              />
            }
            label="Enable notifications for this task"
          />

          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" onClose={() => setSuccess(false)}>
              Task created successfully!
            </Alert>
          )}

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
  );
};

export default TaskForm;
