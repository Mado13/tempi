--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Postgres.app)
-- Dumped by pg_dump version 17.5 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: job_application_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.job_application_status AS ENUM (
    'submitted',
    'viewed',
    'shortlisted',
    'rejected',
    'hired'
);


--
-- Name: position_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.position_status AS ENUM (
    'open',
    'filled',
    'closed',
    'canceled'
);


--
-- Name: project_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.project_status AS ENUM (
    'published',
    'in_progress',
    'completed',
    'canceled',
    'archived'
);


--
-- Name: rate_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.rate_type AS ENUM (
    'daily',
    'hourly'
);


--
-- Name: worker_availability; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.worker_availability AS ENUM (
    'full_time',
    'part_time',
    'contract'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.addresses (
    id uuid NOT NULL,
    google_place_id character varying(255) NOT NULL,
    formatted_address character varying(255) NOT NULL,
    locality character varying(255),
    district character varying(255),
    coordinates public.geometry NOT NULL,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


--
-- Name: company_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_profiles (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    business_number character varying(255) NOT NULL,
    logo_key character varying(255),
    address_id uuid,
    employer_profile_id uuid,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


--
-- Name: employer_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employer_profiles (
    id uuid NOT NULL,
    company_name character varying(255),
    business_type character varying(255),
    description text,
    location character varying(255),
    user_id uuid NOT NULL,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


--
-- Name: job_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_applications (
    id uuid NOT NULL,
    status public.job_application_status DEFAULT 'submitted'::public.job_application_status NOT NULL,
    position_id uuid,
    worker_profile_id uuid,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


--
-- Name: project_positions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_positions (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    rate numeric NOT NULL,
    rate_type public.rate_type DEFAULT 'hourly'::public.rate_type NOT NULL,
    currency character varying(255) DEFAULT 'NIS'::character varying NOT NULL,
    status public.position_status DEFAULT 'open'::public.position_status NOT NULL,
    classification_code character varying(255) NOT NULL,
    number_of_employees integer DEFAULT 1 NOT NULL,
    applications_count integer DEFAULT 0 NOT NULL,
    favorites_count integer DEFAULT 0 NOT NULL,
    notes text,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    notes text,
    status public.project_status DEFAULT 'published'::public.project_status NOT NULL,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    address_id uuid,
    employer_profile_id uuid NOT NULL,
    company_profile_id uuid NOT NULL,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    CONSTRAINT end_after_start CHECK ((end_date >= start_date))
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    phone_number character varying(255),
    "current_role" character varying(255) DEFAULT 'worker'::character varying NOT NULL,
    fcm_token character varying(255),
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


--
-- Name: users_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token bytea NOT NULL,
    context character varying(255) NOT NULL,
    sent_to character varying(255),
    inserted_at timestamp(0) without time zone NOT NULL
);


--
-- Name: worker_favorite_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.worker_favorite_jobs (
    id uuid NOT NULL,
    worker_profile_id uuid NOT NULL,
    position_id uuid NOT NULL,
    inserted_at timestamp(0) without time zone NOT NULL
);


--
-- Name: worker_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.worker_profiles (
    id uuid NOT NULL,
    full_name character varying(255),
    skills character varying(255)[] DEFAULT ARRAY[]::character varying[],
    experience_years integer,
    bio text,
    hourly_rate numeric(10,2),
    availability public.worker_availability,
    user_id uuid NOT NULL,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: company_profiles company_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_profiles
    ADD CONSTRAINT company_profiles_pkey PRIMARY KEY (id);


--
-- Name: employer_profiles employer_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employer_profiles
    ADD CONSTRAINT employer_profiles_pkey PRIMARY KEY (id);


--
-- Name: job_applications job_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_pkey PRIMARY KEY (id);


--
-- Name: project_positions project_positions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_positions
    ADD CONSTRAINT project_positions_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_tokens users_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_tokens
    ADD CONSTRAINT users_tokens_pkey PRIMARY KEY (id);


--
-- Name: worker_favorite_jobs worker_favorite_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_favorite_jobs
    ADD CONSTRAINT worker_favorite_jobs_pkey PRIMARY KEY (id);


--
-- Name: worker_profiles worker_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_profiles
    ADD CONSTRAINT worker_profiles_pkey PRIMARY KEY (id);


--
-- Name: addresses_coordinates_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX addresses_coordinates_index ON public.addresses USING gist (coordinates);


--
-- Name: addresses_district_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX addresses_district_index ON public.addresses USING btree (district);


--
-- Name: addresses_google_place_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX addresses_google_place_id_index ON public.addresses USING btree (google_place_id);


--
-- Name: addresses_locality_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX addresses_locality_index ON public.addresses USING btree (locality);


--
-- Name: company_profiles_business_number_index; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX company_profiles_business_number_index ON public.company_profiles USING btree (business_number);


--
-- Name: company_profiles_employer_profile_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX company_profiles_employer_profile_id_index ON public.company_profiles USING btree (employer_profile_id);


--
-- Name: employer_profiles_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX employer_profiles_user_id_index ON public.employer_profiles USING btree (user_id);


--
-- Name: job_applications_position_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX job_applications_position_id_index ON public.job_applications USING btree (position_id);


--
-- Name: job_applications_position_id_worker_profile_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX job_applications_position_id_worker_profile_id_index ON public.job_applications USING btree (position_id, worker_profile_id);


--
-- Name: job_applications_worker_profile_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX job_applications_worker_profile_id_index ON public.job_applications USING btree (worker_profile_id);


--
-- Name: project_positions_classification_code_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX project_positions_classification_code_index ON public.project_positions USING btree (classification_code);


--
-- Name: project_positions_project_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX project_positions_project_id_index ON public.project_positions USING btree (project_id);


--
-- Name: project_positions_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX project_positions_status_index ON public.project_positions USING btree (status);


--
-- Name: projects_company_profile_id_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_company_profile_id_status_index ON public.projects USING btree (company_profile_id, status);


--
-- Name: projects_start_date_end_date_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_start_date_end_date_index ON public.projects USING btree (start_date, end_date);


--
-- Name: users_current_role_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_current_role_index ON public.users USING btree ("current_role");


--
-- Name: users_phone_number_index; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_phone_number_index ON public.users USING btree (phone_number);


--
-- Name: users_tokens_context_token_index; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_tokens_context_token_index ON public.users_tokens USING btree (context, token);


--
-- Name: users_tokens_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_tokens_user_id_index ON public.users_tokens USING btree (user_id);


--
-- Name: worker_favorite_jobs_position_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX worker_favorite_jobs_position_id_index ON public.worker_favorite_jobs USING btree (position_id);


--
-- Name: worker_favorite_jobs_worker_id_job_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX worker_favorite_jobs_worker_id_job_id_index ON public.worker_favorite_jobs USING btree (worker_profile_id, position_id);


--
-- Name: worker_favorite_jobs_worker_profile_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX worker_favorite_jobs_worker_profile_id_index ON public.worker_favorite_jobs USING btree (worker_profile_id);


--
-- Name: worker_profiles_availability_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX worker_profiles_availability_index ON public.worker_profiles USING btree (availability);


--
-- Name: worker_profiles_hourly_rate_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX worker_profiles_hourly_rate_index ON public.worker_profiles USING btree (hourly_rate);


--
-- Name: worker_profiles_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX worker_profiles_user_id_index ON public.worker_profiles USING btree (user_id);


--
-- Name: company_profiles company_profiles_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_profiles
    ADD CONSTRAINT company_profiles_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id);


--
-- Name: company_profiles company_profiles_employer_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_profiles
    ADD CONSTRAINT company_profiles_employer_profile_id_fkey FOREIGN KEY (employer_profile_id) REFERENCES public.employer_profiles(id) ON DELETE CASCADE;


--
-- Name: employer_profiles employer_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employer_profiles
    ADD CONSTRAINT employer_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: job_applications job_applications_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.project_positions(id) ON DELETE CASCADE;


--
-- Name: job_applications job_applications_worker_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_worker_profile_id_fkey FOREIGN KEY (worker_profile_id) REFERENCES public.worker_profiles(id) ON DELETE CASCADE;


--
-- Name: project_positions project_positions_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_positions
    ADD CONSTRAINT project_positions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: projects projects_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id) ON DELETE SET NULL;


--
-- Name: projects projects_company_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_company_profile_id_fkey FOREIGN KEY (company_profile_id) REFERENCES public.company_profiles(id) ON DELETE RESTRICT;


--
-- Name: projects projects_employer_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_employer_profile_id_fkey FOREIGN KEY (employer_profile_id) REFERENCES public.employer_profiles(id) ON DELETE RESTRICT;


--
-- Name: users_tokens users_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_tokens
    ADD CONSTRAINT users_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: worker_favorite_jobs worker_favorite_jobs_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_favorite_jobs
    ADD CONSTRAINT worker_favorite_jobs_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.project_positions(id) ON DELETE CASCADE;


--
-- Name: worker_favorite_jobs worker_favorite_jobs_worker_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_favorite_jobs
    ADD CONSTRAINT worker_favorite_jobs_worker_profile_id_fkey FOREIGN KEY (worker_profile_id) REFERENCES public.worker_profiles(id) ON DELETE CASCADE;


--
-- Name: worker_profiles worker_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_profiles
    ADD CONSTRAINT worker_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

INSERT INTO public."schema_migrations" (version) VALUES (20250626220906);
INSERT INTO public."schema_migrations" (version) VALUES (20250706215158);
INSERT INTO public."schema_migrations" (version) VALUES (20250721210021);
INSERT INTO public."schema_migrations" (version) VALUES (20250728215102);
INSERT INTO public."schema_migrations" (version) VALUES (20250810193258);
INSERT INTO public."schema_migrations" (version) VALUES (20250818192750);
INSERT INTO public."schema_migrations" (version) VALUES (20250818192809);
