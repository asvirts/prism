# Prism - Business Intelligence Dashboard

Prism is a comprehensive business intelligence dashboard built with Next.js, TypeScript, and Tailwind CSS. It provides powerful data analysis capabilities with AI-powered insights, interactive visualizations, and custom reporting.

## Features

- **Data Connectors**: Import data from CSV files, APIs, and databases
- **AI-Powered Analysis**: Automatically identify trends, anomalies, and correlations in your data
- **Interactive Visualizations**: Create beautiful charts with Recharts
- **Efficient Data Handling**: Optimized for large datasets with proper caching

## Technologies Used

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Database**: Supabase
- **AI Integration**: OpenAI API
- **Visualization**: Recharts
- **Authentication**: Supabase Auth (coming soon)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/prism.git
   cd prism
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your API keys

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   OPENAI_API_KEY=your-openai-api-key
   ```

4. Run the development server

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Supabase Setup

1. Create a new Supabase project
2. Create the following tables:
   - `user_settings`: For storing user preferences
   - `datasets`: For storing imported data
   - `reports`: For storing report configurations

## Detailed Usage Guide

### 1. Navigating the Dashboard

The Prism dashboard is the central hub for all your data analysis activities. Here's how to navigate it:

1. Open the application in your browser and click on "Dashboard" in the navigation bar.
2. The dashboard displays several key components:
   - **Data Import**: Tools for bringing data into the system
   - **Visualizations**: Interactive charts and graphs
   - **AI Analysis**: AI-powered insights from your data
   - **Data Management**: Manage your datasets

### 2. Importing Data

Prism supports multiple data sources to get your data into the system:

#### CSV Import

1. On the dashboard, locate the "Import Data" section and click on "CSV Upload"
2. Click the file upload area or drag and drop your CSV file
3. The system will parse your CSV and display a preview of the data
4. Verify the data types and headers are correct
5. Click "Import" to complete the process

#### API Connection

1. On the dashboard, go to the "Import Data" section and select "API Connection"
2. Enter the API endpoint URL
3. If the API requires authentication, click "Add Authentication" and enter your credentials
4. Choose the authentication type (Basic, Bearer Token, API Key)
5. Click "Test Connection" to verify access
6. Once connected, click "Import Data" to fetch and parse the data

### 3. Creating Visualizations

After importing your data, you can create various visualizations:

1. Navigate to the "Visualizations" section of the dashboard
2. Click "Create New Chart"
3. Select a chart type (Line, Bar, Area, Pie, or Scatter)
4. Configure your chart:
   - Select the data source from your imported datasets
   - Choose X and Y axes
   - Add data series (for multi-series charts)
   - Configure grouping and aggregation (sum, average, count)
   - Set colors and styling options
5. Click "Generate Chart" to create the visualization
6. Use the interactive features to explore your data:
   - Hover for tooltips
   - Zoom in/out (for time series)
   - Filter data points

### 4. AI Analysis

Prism's AI-powered analysis helps you discover insights in your data:

1. Navigate to the "AI Analysis" section
2. Select the dataset you want to analyze
3. Configure analysis options:
   - Focus: Choose what to focus on (trends, anomalies, correlations, or all)
   - Field Selection: Identify time, value, and category fields
4. Click "Run AI Analysis"
5. Review the results in the following tabs:
   - **Insights**: Key actionable insights from your data
   - **Trends**: Identified patterns and trends
   - **Anomalies**: Unusual data points or outliers
   - **Correlations**: Relationships between different variables
6. Click "Create Visualization" to automatically generate relevant charts based on the analysis

### 5. Working with Large Datasets

Prism is optimized for handling large datasets efficiently:

1. When importing large files (>10MB), the system will automatically:

   - Sample the data for preview
   - Apply efficient parsing strategies
   - Use streaming where possible

2. For visualization of large datasets:

   - Use the "Data Sampling" option to control how many data points to display
   - Apply filters to focus on specific segments of your data
   - Use date range selectors for time series data

3. For AI analysis of large datasets:
   - The system automatically samples the data to stay within API limits
   - You can adjust the sampling method in the advanced options
   - Consider using more specific "Focus" options to get more targeted results

### 6. Saving and Sharing

To save your work and share insights:

1. After creating visualizations or running analyses, click the "Save" button
2. Enter a name and optional description
3. Choose where to save:
   - "My Dashboard" for personal use
   - "Shared Dashboards" to make it available to others
4. To share specific insights:
   - Click the "Share" button on any visualization or analysis
   - Select "Copy Link" to get a direct URL
   - Or choose "Export" to download as PNG, PDF, or CSV

### 7. Troubleshooting

If you encounter issues:

1. **Data Import Problems**

   - Ensure CSV files use standard formatting and UTF-8 encoding
   - For API connections, verify your authentication credentials and endpoint URLs

2. **Visualization Issues**

   - Check that your data has appropriate types (numbers for numerical axes, etc.)
   - For time series, ensure dates are in a recognized format (YYYY-MM-DD recommended)

3. **AI Analysis Errors**

   - Verify your OpenAI API key is valid and has sufficient quota
   - For timeout errors, try reducing the dataset size or focusing the analysis

4. **Performance Issues**
   - For very large datasets, consider applying filters before visualization
   - Use the browser's refresh button if the dashboard becomes unresponsive

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.io/)
- [Recharts](https://recharts.org/)
- [OpenAI](https://openai.com/)
