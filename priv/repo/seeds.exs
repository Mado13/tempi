# priv/repo/seeds.exs

# Alias all the modules we'll be using
alias Tempi.Repo
alias Tempi.Accounts.User
alias Tempi.Profiles.EmployerProfile
alias Tempi.Profiles.WorkerProfile
alias Tempi.Profiles.CompanyProfile
alias Tempi.Address
alias Tempi.Job
alias Tempi.JobClassification
alias Tempi.JobApplication
alias Tempi.WorkerFavoriteJob

# Start fresh by clearing out existing data
Repo.delete_all(WorkerFavoriteJob)
Repo.delete_all(JobApplication)
Repo.delete_all(JobClassification)
Repo.delete_all(Job)
Repo.delete_all(CompanyProfile)
Repo.delete_all(Address)
Repo.delete_all(WorkerProfile)
Repo.delete_all(EmployerProfile)
Repo.delete_all(User)

# --- Create a User and Profiles ---

# Create a user first
user =
  %User{}
  |> User.changeset(%{
    # Using a common local format
    phone_number: "052-5550123",
    current_role: :employer
  })
  # Using insert! to raise on error for easier debugging
  |> Repo.insert!()

IO.puts("✅ Created User: #{user.phone_number}")

# Create an employer profile for the user
{:ok, employer_profile} =
  %EmployerProfile{}
  |> EmployerProfile.changeset(%{
    user_id: user.id,
    company_name: "Cafe Deluxe Group",
    business_type: "Restaurants and Cafes",
    description: "A chain of premium cafes and restaurants.",
    location: "Tel Aviv"
  })
  |> Repo.insert()

IO.puts("✅ Created Employer Profile: #{employer_profile.company_name}")

# Create a worker profile for the same user
{:ok, worker_profile} =
  %WorkerProfile{}
  |> WorkerProfile.changeset(%{
    user_id: user.id,
    full_name: "Yoni Cohen",
    skills: ["Bartending", "Customer Service", "Latte Art"],
    experience_years: 5,
    bio: "Experienced and friendly bartender with a passion for craft cocktails.",
    hourly_rate: "90.00",
    availability: :part_time
  })
  |> Repo.insert()

IO.puts("✅ Created Worker Profile: #{worker_profile.full_name}")

# --- Create an Address and Company Profile ---

# Create an address for the company
{:ok, address} =
  %Address{}
  |> Address.changeset(%{
    google_place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
    formatted_address: "Dizengoff St 90, Tel Aviv-Yafo, Israel",
    locality: "Tel Aviv-Yafo",
    district: "Tel Aviv",
    location: %{lat: 32.078, lng: 34.775}
  })
  |> Repo.insert()

IO.puts("✅ Created Address: #{address.formatted_address}")

# Create a company profile associated with the employer and address
{:ok, company_profile} =
  %CompanyProfile{}
  |> CompanyProfile.changeset(%{
    name: "Cafe Deluxe - Dizengoff",
    business_number: "51-555432-1",
    employer_profile_id: employer_profile.id,
    address_id: address.id
  })
  |> Repo.insert()

IO.puts("✅ Created Company Profile: #{company_profile.name}")

# --- Create Multiple Jobs ---

# List of job attributes to create using the new classification codes
jobs_to_create = [
  %{
    start_date: ~D[2025-08-01],
    end_date: ~D[2025-08-10],
    number_of_employees: 2,
    rate: "80.00",
    rate_type: :hourly,
    # Waiter and Bartender
    classifications: ["111", "112"]
  },
  %{
    start_date: ~D[2025-08-15],
    end_date: ~D[2025-08-20],
    number_of_employees: 3,
    rate: "95.00",
    rate_type: :hourly,
    # Cook
    classifications: ["114"]
  },
  %{
    start_date: ~D[2025-09-01],
    end_date: ~D[2025-09-30],
    number_of_employees: 2,
    rate: "85.00",
    rate_type: :hourly,
    status: :filled,
    # Barista and Line Cook
    classifications: ["113", "115"]
  },
  %{
    start_date: ~D[2025-07-20],
    end_date: ~D[2025-07-25],
    number_of_employees: 4,
    rate: "75.00",
    rate_type: :hourly,
    status: :finished,
    # Waiter
    classifications: ["111"]
  }
]

# Create jobs and store them to be used later
created_jobs =
  for job_attrs <- jobs_to_create do
    job_data =
      Map.merge(job_attrs, %{
        address_id: address.id,
        employer_profile_id: employer_profile.id,
        company_profile_id: company_profile.id
      })

    case Job.changeset(%Job{}, job_data) |> Repo.insert() do
      {:ok, job} ->
        IO.puts("✅ Created Job starting on: #{job.start_date}")

        # Create job classifications for the job
        for code <- job_attrs.classifications do
          %JobClassification{}
          |> JobClassification.changeset(%{
            job_id: job.id,
            classification_code: code
          })
          |> Repo.insert!()
        end

        IO.puts("   - Added classifications: #{Enum.join(job_attrs.classifications, ", ")}")
        # return the job
        job

      {:error, changeset} ->
        IO.inspect(changeset, label: "Error creating job")
        # return nil on error
        nil
    end
  end
  # Remove nils from the list
  |> Enum.reject(&is_nil/1)

# --- Create Job Applications and Favorites ---

if Enum.any?(created_jobs) do
  first_job = List.first(created_jobs)
  second_job = List.last(created_jobs)

  # Create a job application from the worker to the first job
  %JobApplication{}
  |> JobApplication.changeset(%{
    job_id: first_job.id,
    worker_profile_id: worker_profile.id,
    status: :submitted
  })
  |> Repo.insert!()

  IO.puts("✅ Created Job Application from #{worker_profile.full_name} for job #{first_job.id}")

  # Make the worker favorite the second job
  %WorkerFavoriteJob{}
  |> WorkerFavoriteJob.changeset(%{
    job_id: second_job.id,
    worker_profile_id: worker_profile.id
  })
  |> Repo.insert!()

  IO.puts("✅ Worker #{worker_profile.full_name} favorited job #{second_job.id}")
end

IO.puts("\n🎉 Database seeding complete!")
