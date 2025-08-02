# Interview Management Feature

## Overview
This feature provides a comprehensive interview management system for the ATS platform, specifically focusing on selected interviews with beautiful UI design and advanced functionality.

## Features

### Selected Interviews Tab
- **Beautiful Design**: Modern card-based layout with gradient backgrounds and hover effects
- **Real-time Data**: Fetches data from `/api/interviews/selected` endpoint
- **Search & Filter**: Search by name, email, job title, or company
- **Stage Filtering**: Filter by interview stage (First Interview, Second Interview, Final Interview)
- **Statistics Dashboard**: Shows total candidates, stage counts, and average salary

### Key Components

#### Statistics Cards
- Total Candidates count
- First Interview count
- Second Interview count  
- Final Interview count
- Average Expected Salary

#### Candidate Cards
Each candidate card displays:
- Profile avatar with initials fallback
- Name and interview stage badge
- Contact information (email, phone)
- Job details (title, company, location)
- Skills as badges
- Experience level with color coding
- Expected salary
- Action buttons (View, Contact, Resume, Schedule)

#### Action Buttons
- **Schedule Interview**: Individual interview scheduling
- **Bulk Schedule**: Schedule multiple interviews at once
- **View**: View candidate details
- **Contact**: Contact candidate
- **Resume**: Access candidate resume

### API Integration
- Uses `BASE_API_URL` from `BaseUrlApi.js`
- Fetches data from `http://localhost:5000/api/interviews/selected`
- Handles loading states and error scenarios
- Real-time data updates

### Interview Scheduling
- **Individual Scheduling**: Schedule interviews for specific candidates
- **Bulk Scheduling**: Select multiple candidates and schedule interviews
- **Date/Time Selection**: Calendar picker and time input
- **Duration Options**: 30, 45, 60, 90 minutes
- **Interview Types**: Video Call, Phone Call, In Person
- **Notes**: Add additional notes for interviews

## Technical Implementation

### Components
- `SelectedInterviews`: Main component for selected interviews
- `InterviewManagement`: Parent component with tab navigation
- UI Components: Cards, Badges, Avatars, Buttons, Dialogs

### State Management
- Loading states for API calls
- Error handling and retry functionality
- Search and filter state
- Dialog states for scheduling

### Styling
- Tailwind CSS with custom gradients
- Responsive design (mobile, tablet, desktop)
- Hover effects and transitions
- Color-coded badges for different stages

## Usage

1. Navigate to the "Interviews" tab in the left sidebar
2. The "Selected" tab will be active by default
3. Use the search bar to find specific candidates
4. Use the stage filter to view candidates by interview stage
5. Click "Schedule" on any candidate card to schedule an interview
6. Use "Bulk Schedule" to schedule multiple interviews at once

## API Response Format

```json
{
  "success": true,
  "totalCandidates": 2,
  "candidates": [
    {
      "id": 2,
      "name": "Faiz Rahman",
      "email": "faiz@appitsoftware.com",
      "phone": "9709415311",
      "skills": "React java dsa",
      "experience": "2-3 years",
      "expectedSalary": 59999,
      "interviewStage": "First Interview",
      "job": {
        "title": "Senior UX/UI Designer",
        "company": "NextWave Technologies",
        "location": "Dubai"
      }
    }
  ],
  "stageCounts": {
    "First Interview": 1,
    "Second Interview": 1,
    "Final Interview": 0
  }
}
```

## Future Enhancements
- Video interview integration
- Calendar integration
- Email notifications
- Interview feedback system
- AI-powered interview insights
- Interview recording and transcription 