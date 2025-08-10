import { Link as RouterLink } from 'react-router-dom';
import { Avatar, Tabs, Tab, Card, CardContent } from '@mui/material';

const [tabIndex, setTabIndex] = useState(0);

// Return code
{selectedRequest.status === 'Completed' && selectedRequest.caregiver && (
    <>
    <Typography variant="h6" gutterBottom>
        Caregiver Who Fulfilled This Request
    </Typography>
    <Box textAlign="center">
        <Avatar
        src={selectedRequest.caregiver.image}
        alt={selectedRequest.caregiver.name}
        sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}
        />
        <Typography variant="subtitle1">{selectedRequest.caregiver.name}</Typography>
        <Typography variant="body2">{selectedRequest.caregiver.email}</Typography>
    </Box>
    </>
)}

{selectedRequest.status === 'Pending' && selectedRequest.interestedCaregivers && (
    <>
    <Typography variant="h6" gutterBottom>
        Caregivers Interested in This Request
    </Typography>
    <Tabs
        value={tabIndex}
        onChange={(e, newIndex) => setTabIndex(newIndex)}
        textColor="primary"
        indicatorColor="primary"
        variant="scrollable"
    >
        {selectedRequest.interestedCaregivers.map((cg, idx) => (
        <Tab key={idx} label={cg.name} />
        ))}
    </Tabs>

    <Box mt={2}>
        {selectedRequest.interestedCaregivers.map((cg, idx) => (
        tabIndex === idx && (
            <Card key={idx} sx={{ mb: 2 }}>
            <CardContent>
                <Box textAlign="center">
                <Avatar
                    src={cg.image}
                    alt={cg.name}
                    sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}
                />
                <Typography variant="h6">{cg.name}</Typography>
                <Typography variant="body2">{cg.email}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2">Reviews:</Typography>
                {cg.reviews && cg.reviews.length > 0 ? (
                cg.reviews.map((r, i) => (
                    <Typography key={i} variant="body2" sx={{ mb: 1 }}>
                    <strong>{r.reviewer}:</strong> {r.text}
                    </Typography>
                ))
                ) : (
                <Typography variant="body2">No reviews yet.</Typography>
                )}

                {/* Action Buttons */}
                <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1} mt={2}>
                <Button
                    variant="contained"
                    color="success"
                    onClick={() => console.log('Accepted:', cg.name)}
                >
                    Accept
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={() => console.log('Declined:', cg.name)}
                >
                    Decline
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => console.log('Shortlisted:', cg.name)}
                >
                    Shortlist
                </Button>
                <Button
                    component={RouterLink}
                    to="/dashboard/messages"
                    variant="contained"
                    sx={{
                    backgroundColor: '#648E87',
                    borderRadius: '20px',
                    textTransform: 'none',
                    '&:hover': {
                        backgroundColor: '#4f766f'
                    }
                    }}
                >
                    Message
                </Button>

                </Box>
            </CardContent>              
            </Card>
        )
        ))}
    </Box>
    </>
)}