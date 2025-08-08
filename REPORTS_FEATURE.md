# Reports Feature Documentation

## Overview

The Reports feature provides comprehensive analytics and reporting capabilities for the ATS (Applicant Tracking System). It displays detailed information about jobs, candidates, interviews, customers, and timesheets with beautiful visualizations and export functionality.

## Features

### 📊 Dashboard Overview
- **Summary Cards**: Quick overview of key metrics
  - Total Jobs with fill rate
  - Candidates with conversion rate
  - Interviews with completion rate
  - Customers with active rate
  - Timesheets with approval rate
  - Total Activities

### 🔍 Detailed Analytics
- **Tabbed Interface**: Organized data presentation
  - Jobs: Active, filled, paused, and closed positions
  - Candidates: Application status and profiles
  - Interviews: Scheduled and completed interviews
  - Customers: Company information and status
  - Timesheets: Time tracking and approval status

### 📈 Key Insights
- Automated insights highlighting areas of concern
- Performance metrics and trends
- Actionable recommendations

### 📤 Export Functionality
- **Excel Export**: Complete data export with multiple sheets
  - Summary sheet with key metrics
  - Jobs sheet with detailed job information
  - Candidates sheet with application details
  - Interviews sheet with scheduling information
  - Customers sheet with company data
  - Timesheets sheet with time tracking data

## API Integration

The reports feature integrates with the backend API endpoint:
```
GET /api/reports/reports-all
```

### Data Structure

The API returns comprehensive data including:
- **Metadata**: Generation timestamp and record counts
- **Summary**: High-level metrics for all categories
- **Details**: Detailed data for each category
- **Insights**: Automated analysis and recommendations
- **Trends**: Performance trends over time

## Technical Implementation

### Dependencies
- `xlsx`: Excel file generation
- `file-saver`: File download functionality
- React hooks for state management
- Tailwind CSS for styling

### Components Used
- Cards for metric display
- Tables for detailed data
- Tabs for organized navigation
- Badges for status indicators
- Alerts for insights display
- Progress indicators for metrics

### State Management
- Loading states for API calls
- Error handling with retry functionality
- Data caching for performance

## Usage

1. **Access**: Navigate to the Reports tab in the main dashboard
2. **View**: Browse through different categories using the tabbed interface
3. **Export**: Click the "Export to Excel" button to download comprehensive reports
4. **Refresh**: Data automatically loads on component mount

## File Structure

```
app/components/reports.tsx          # Main reports component
BaseUrlApi.js                       # API base URL configuration
REPORTS_FEATURE.md                 # This documentation
```

## Future Enhancements

- Real-time data updates
- Custom date range filtering
- Advanced chart visualizations
- Scheduled report generation
- Email report delivery
- Custom report templates

## Troubleshooting

### Common Issues

1. **Data not loading**: Check API endpoint availability
2. **Export not working**: Ensure xlsx and file-saver dependencies are installed
3. **Styling issues**: Verify Tailwind CSS classes are properly applied

### Error Handling

The component includes comprehensive error handling:
- Loading states with spinner
- Error messages with retry functionality
- Graceful fallbacks for missing data

## Performance Considerations

- Efficient data fetching with proper error handling
- Optimized rendering with React best practices
- Minimal re-renders through proper state management
- Responsive design for various screen sizes 