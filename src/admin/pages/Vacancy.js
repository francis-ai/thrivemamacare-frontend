// src/pages/Vacancy.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  Grid,
  Modal,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const Vacancy = () => {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [currentVacancy, setCurrentVacancy] = useState(null);
  const [formData, setFormData] = useState({
    category: "caregiver",
    caregiver_name: "",
    caregiver_address: "",
    job_offer: "",
    caregiver_bio: "",
    caregiver_rate: "",
    caregiver_image: null,
    user_job_description: "",
    user_caregiver_type: "",
    user_amount_offered: "",
  });
  const [deleteId, setDeleteId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Fetch vacancies
  const fetchVacancies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/admin/vacancy`);
      setVacancies(res.data);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to fetch vacancies", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  // Open Add / Update Modal
  const handleOpenForm = (vacancy = null) => {
    if (vacancy) {
      setCurrentVacancy(vacancy);
      setFormData({
        category: vacancy.category,
        caregiver_name: vacancy.caregiver_name || "",
        caregiver_address: vacancy.caregiver_address || "",
        job_offer: vacancy.job_offer || "",
        caregiver_bio: vacancy.caregiver_bio || "",
        caregiver_rate: vacancy.caregiver_rate || "",
        caregiver_image: null,
        user_job_description: vacancy.user_job_description || "",
        user_caregiver_type: vacancy.user_caregiver_type || "",
        user_amount_offered: vacancy.user_amount_offered || "",
      });
      setPreviewImage(vacancy.caregiver_image ? `${BASE_URL}/${vacancy.caregiver_image}` : null);
    } else {
      setCurrentVacancy(null);
      setFormData({
        category: "caregiver",
        caregiver_name: "",
        caregiver_address: "",
        job_offer: "",
        caregiver_bio: "",
        caregiver_rate: "",
        caregiver_image: null,
        user_job_description: "",
        user_caregiver_type: "",
        user_amount_offered: "",
      });
      setPreviewImage(null);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => setOpenForm(false);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      setPreviewImage(URL.createObjectURL(files[0])); // Preview image
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Submit Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting formData:", formData); // Debug formData

    const data = new FormData();
    for (const key in formData) {
      if (formData[key]) data.append(key, formData[key]);
    }

    try {
      if (currentVacancy) {
        await axios.put(`${BASE_URL}/api/admin/vacancy/${currentVacancy.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSnackbar({ open: true, message: "Vacancy updated successfully", severity: "success" });
      } else {
        await axios.post(`${BASE_URL}/api/admin/vacancy`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSnackbar({ open: true, message: "Vacancy added successfully", severity: "success" });
      }
      fetchVacancies();
      handleCloseForm();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to submit vacancy", severity: "error" });
    }
  };

  // Delete Vacancy
  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/admin/vacancy/${deleteId}`);
      setDeleteId(null);
      setOpenDelete(false);
      setSnackbar({ open: true, message: "Vacancy deleted successfully", severity: "success" });
      fetchVacancies();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to delete vacancy", severity: "error" });
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Vacancies
      </Typography>
      <Button variant="contained" onClick={() => handleOpenForm()} sx={{ mb: 2 }}>
        Add Vacancy
      </Button>

      {/* Vacancies Grid */}
      <Grid container spacing={2}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          vacancies.map((vacancy) => (
            <Grid item xs={12} md={6} key={vacancy.id}>
              <Box
                sx={{
                  p: 2,
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Typography>
                  <strong>Category:</strong> {vacancy.category}
                </Typography>
                {vacancy.category === "caregiver" ? (
                  <>
                    <Typography>Name: {vacancy.caregiver_name}</Typography>
                    <Typography>Address: {vacancy.caregiver_address}</Typography>
                    <Typography>Job Offered: {vacancy.job_offer}</Typography>
                    <Typography>Bio: {vacancy.caregiver_bio}</Typography>
                    <Typography>Rate: ₦{vacancy.caregiver_rate}</Typography>
                  </>
                ) : (
                  <>
                    <Typography>Job Description: {vacancy.user_job_description}</Typography>
                    <Typography>Caregiver Type: {vacancy.user_caregiver_type}</Typography>
                    <Typography>Amount Offered: ₦{vacancy.user_amount_offered}</Typography>
                  </>
                )}
                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  <Button variant="outlined" onClick={() => handleOpenForm(vacancy)}>
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      setDeleteId(vacancy.id);
                      setOpenDelete(true);
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add / Update Modal */}
      <Modal open={openForm} onClose={handleCloseForm}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {currentVacancy ? "Update Vacancy" : "Add Vacancy"}
          </Typography>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select name="category" value={formData.category} onChange={handleChange} label="Category">
                <MenuItem value="caregiver">Caregiver</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>

            {/* Caregiver Fields */}
            {formData.category === "caregiver" && (
              <>
                <TextField
                  fullWidth
                  label="Name"
                  name="caregiver_name"
                  value={formData.caregiver_name}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Address"
                  name="caregiver_address"
                  value={formData.caregiver_address}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Job / Service Offered"
                  name="job_offer"
                  value={formData.job_offer}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Bio/Description"
                  name="caregiver_bio"
                  value={formData.caregiver_bio}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Rate"
                  type="number"
                  name="caregiver_rate"
                  value={formData.caregiver_rate}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />

                {/* Image Upload & Preview */}
                <Button variant="contained" component="label" sx={{ mb: 2 }}>
                  Upload Image
                  <input type="file" hidden name="caregiver_image" onChange={handleChange} />
                </Button>
                {previewImage && (
                  <Box sx={{ mb: 2 }}>
                    <img
                      src={previewImage}
                      alt="Preview"
                      style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8 }}
                    />
                  </Box>
                )}
              </>
            )}

            {/* User Fields */}
            {formData.category === "user" && (
              <>
                <TextField
                  fullWidth
                  label="Job Description"
                  name="user_job_description"
                  value={formData.user_job_description}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Caregiver Type Needed"
                  name="user_caregiver_type"
                  value={formData.user_caregiver_type}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Amount Offered"
                  type="number"
                  name="user_amount_offered"
                  value={formData.user_amount_offered}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
              </>
            )}

            <Button type="submit" variant="contained">
              {currentVacancy ? "Update" : "Add"}
            </Button>
          </form>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this vacancy?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Vacancy;
