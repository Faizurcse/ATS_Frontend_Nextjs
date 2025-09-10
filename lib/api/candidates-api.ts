// API service for candidates matching endpoints
const BASE_URL = 'http://158.220.127.100:8000';

export interface CandidateMatch {
  candidate_id: number;
  job_id: number;
  candidate_name: string;
  candidate_email: string;
  experience: string;
  skills: string[];
  location: string;
  skills_matched_score: {
    score: number;
    explanation: string;
  };
  experience_score: {
    score: number;
    explanation: string;
  };
  overall_score: {
    score: number;
    explanation: string;
    fit_status: string;
  };
  parsed_url: string;
  resume_download_url: string;
  job_details_url: string;
  candidate_data: {
    Name: string;
    Email: string;
    Phone?: string;
    GitHub?: string;
    Skills: string[];
    Location: string;
    Projects?: Array<{
      Name: string;
      Description: string;
      Technologies: string[];
    }>;
    Education?: Array<{
      Year: string;
      Field?: string;
      Degree: string;
      Institution: string;
    }>;
    Languages?: string[];
    Experience?: Array<{
      Company: string;
      Duration: string;
      Position: string;
      Description: string;
    }>;
    Certifications?: string[];
    TotalExperience: string;
  };
}

export interface CandidatesResponse {
  success: boolean;
  job_id: number;
  job_title: string;
  company: string;
  experience_level: string;
  skills: string;
  location: string;
  total_candidates: number;
  min_score_threshold: number;
  candidates: CandidateMatch[];
  debug_info: {
    matching_method: string;
    resumes_checked: number;
    min_score_threshold: number;
  };
  message: string;
}

export interface AllMatchesResponse {
  success: boolean;
  total_jobs: number;
  total_candidates: number;
  jobs: Array<{
    job_title: string;
    company: string;
    experience_level: string;
    skills: string;
    location: string;
    candidates_count: number;
    candidates: CandidateMatch[];
  }>;
  debug_info: {
    jobs_processed: number;
    resumes_checked: number;
    min_score_threshold: number;
    matching_method: string;
  };
}

/**
 * Get matching candidates for a specific job using fast embedding similarity
 * @param jobId - The job ID to get candidates for
 * @param minScore - Minimum match score threshold (default: 0.1)
 * @returns Promise<CandidatesResponse>
 */
export async function getCandidatesForJob(
  jobId: number,
  minScore: number = 0.1
): Promise<CandidatesResponse> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/candidates-matching/candidates-matching/job/${jobId}/candidates-fast?min_score=${minScore}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching candidates for job:', error);
    throw new Error(`Failed to fetch candidates for job ${jobId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all matched candidates across all jobs
 * @param minScore - Minimum match score threshold (default: 0.1)
 * @returns Promise<AllMatchesResponse>
 */
export async function getAllMatches(
  minScore: number = 0.1
): Promise<AllMatchesResponse> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/candidates-matching/all-matches?min_score=${minScore}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all matches:', error);
    throw new Error(`Failed to fetch all matches: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get job details by ID (if needed for additional job information)
 * @param jobId - The job ID
 * @returns Promise<any>
 */
export async function getJobById(jobId: number): Promise<any> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/jobs/${jobId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching job details:', error);
    throw new Error(`Failed to fetch job details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
