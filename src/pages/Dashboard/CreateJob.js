import { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Modal,
  Fade,
  Backdrop,
  Card,
} from "@mui/material";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import { useAuthUser } from "../../context/AuthContextUser";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const primaryColor = "#648E87";
const hoverColor = "#557870";

const styles = {
  primaryButton: {
    backgroundColor: primaryColor,
    "&:hover": { backgroundColor: hoverColor },
    padding: "12px 24px",
    fontWeight: 600,
    fontSize: 16,
  },
  outlinedButton: {
    borderColor: primaryColor,
    color: primaryColor,
    "&:hover": {
      borderColor: hoverColor,
      backgroundColor: "rgba(100, 142, 135, 0.04)",
    },
  },
  modal: { display: "flex", alignItems: "center", justifyContent: "center" },
  modalContent: {
    backgroundColor: "white",
    boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
    borderRadius: 16,
    padding: 0,
    outline: "none",
    maxWidth: "500px",
    width: "90%",
  },
};

export default function CreateJobPage() {
  const { user } = useAuthUser();
  const userId = user?.id;

  const [formData, setFormData] = useState({
    company_name: "",
    job_title: "",
    job_type: "",
    location: "",
    salary_range: "",
    responsibilities: "",
    requirements: "",
    qualification: "",
    experience: "",
    gender: "",
    type: "",
    deadline: "",
    contact_phone: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmitClick = (e) => {
    e.preventDefault();
    const requiredFields = ["company_name", "job_title", "job_type", "location"];
    const missing = requiredFields.filter((f) => !formData[f]);
    if (missing.length > 0) {
      setMessage({
        text: `Please fill: ${missing.join(", ").replace(/_/g, " ")}`,
        type: "error",
      });
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmation(false);
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const jobData = new FormData();
      Object.keys(formData).forEach((key) => jobData.append(key, formData[key]));
      jobData.append("user_id", userId);
      if (image) jobData.append("image", image);

      const res = await axios.post(`${BASE_URL}/api/users/create-job`, jobData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage({ text: res.data.message, type: "success" });
      setFormData({
        company_name: "",
        job_title: "",
        job_type: "",
        location: "",
        salary_range: "",
        responsibilities: "",
        requirements: "",
        qualification: "",
        experience: "",
        gender: "",
        type: "",
        deadline: "",
        contact_phone: "",
        description: "",
      });
      setImage(null);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Error submitting job.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container p-2">
        <Card className="shadow-lg border-0 mb-5" sx={{ borderRadius: 3 }}>
          <div className="card-body p-4 p-md-5">
            <div className="text-center mb-5">
              <h2 className="h3 fw-bold mb-2">Create New Job Posting</h2>
              <div
                className="bg-primary bg-opacity-10 d-inline-block px-4 py-2 rounded-pill"
                style={{ color: primaryColor }}
              >
                <small className="fw-semibold">Fill in the details below</small>
              </div>
            </div>

            {message.text && (
              <Alert
                severity={message.type}
                className="mb-4 rounded-3"
                sx={{
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: message.type === "success" ? "#4caf50" : "#f44336",
                }}
              >
                {message.text}
              </Alert>
            )}

            <form onSubmit={handleSubmitClick}>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {[
                  { key: "company_name", label: "Company Name", required: true },
                  { key: "job_title", label: "Job Title", required: true },
                  { key: "job_type", label: "Job Type", required: true, select: true },
                  { key: "location", label: "Location", required: true },
                  { key: "salary_range", label: "Salary Range" },
                  { key: "qualification", label: "Qualification" },
                  { key: "experience", label: "Experience" },
                  { key: "gender", label: "Gender", select: true },
                  { key: "type", label: "Type", select: true },
                  { key: "contact_phone", label: "Contact Phone" },
                ].map(({ key, label, required, select }) => (
                  <Grid item xs={12} sm={6} key={key} className="flex flex-col gap-1 w-full">
                    {select ? (
                      <TextField
                        select
                        label={label}
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        fullWidth
                        required={required}
                        sx={{ 
                        "& .MuiOutlinedInput-root": 
                        { borderRadius: "12px", 
                        "&:hover fieldset": { borderColor: primaryColor }, }, 
                        "& .MuiInputLabel-root.Mui-focused": { color: primaryColor }, 
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": 
                        { borderColor: primaryColor }, }}
                      >
                        {key === "job_type" && (
                          <>
                            <MenuItem value="Full-Time">Full-Time</MenuItem>
                            <MenuItem value="Part-Time">Part-Time</MenuItem>
                          </>
                        )}
                        {key === "gender" && (
                          <>
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Any">Any</MenuItem>
                          </>
                        )}
                        {key === "type" && (
                          <>
                            <MenuItem value="Live-in">Live-in</MenuItem>
                            <MenuItem value="Live-out">Live-out</MenuItem>
                          </>
                        )}
                      </TextField>
                    ) : (
                      <TextField
                        label={label}
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        fullWidth
                        required={required}
                        sx={{ 
                        "& .MuiOutlinedInput-root": 
                        { borderRadius: "12px", 
                        "&:hover fieldset": { borderColor: primaryColor }, }, 
                        "& .MuiInputLabel-root.Mui-focused": { color: primaryColor }, 
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": 
                        { borderColor: primaryColor }, }}
                      />
                    )}
                  </Grid>
                ))}

                {/* Deadline */} 
                <Grid item xs={12} md={6} className="flex flex-col gap-1 w-full" > 
                  <TextField 
                    type="date" 
                    label="Application Deadline" 
                    name="deadline" 
                    value={formData.deadline} 
                    onChange={handleChange} 
                    fullWidth 
                    InputLabelProps={{ shrink: true }} 
                    sx={{ 
                        "& .MuiOutlinedInput-root": 
                        { borderRadius: "12px", 
                        "&:hover fieldset": { borderColor: primaryColor }, }, 
                        "& .MuiInputLabel-root.Mui-focused": { color: primaryColor }, 
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": 
                        { borderColor: primaryColor }, }} /> 
                </Grid>

                {/* Textareas */}
                {["responsibilities", "requirements", "description"].map((key) => (
                  <Grid item xs={12} key={key} className="flex flex-col gap-1 w-full">
                    <TextField
                      label={key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      name={key}
                      value={formData[key]}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={4}
                      sx={{ 
                        "& .MuiOutlinedInput-root": 
                        { borderRadius: "12px", 
                        "&:hover fieldset": { borderColor: primaryColor }, }, 
                        "& .MuiInputLabel-root.Mui-focused": { color: primaryColor }, 
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": 
                        { borderColor: primaryColor }, }}
                    />
                  </Grid>
                ))}

                {/* Image Upload */}
                <Grid item xs={12}>
                  <Box sx={{ border: "2px dashed #ccc", borderRadius: 3, p: 2, textAlign: "center" }}>
                    <Button variant="outlined" component="label" sx={styles.outlinedButton}>
                      {image ? "Change Company Image" : "+ Upload Company Image"}
                      <input type="file" accept="image/*" hidden onChange={(e) => setImage(e.target.files[0])} />
                    </Button>
                    {image && <Chip label={`Selected: ${image.name}`} sx={{ mt: 2 }} />}
                  </Box>
                </Grid>

                {/* Submit */}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={styles.primaryButton}
                  >
                    {loading ? <CircularProgress size={26} color="inherit" /> : "Create Job Posting"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </div>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
        sx={styles.modal}
      >
        <Fade in={showConfirmation}>
          <Box sx={styles.modalContent} className="p-4 text-center">
            <h4 style={{ color: primaryColor }}>Confirm Job Posting</h4>
            <p>Are you sure you want to post this job?</p>
            <Box className="d-flex justify-content-center gap-3 mt-3">
              <Button variant="outlined" onClick={() => setShowConfirmation(false)} sx={styles.outlinedButton}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleConfirmSubmit} sx={styles.primaryButton}>
                Confirm & Post
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </DashboardLayout>
  );
}
