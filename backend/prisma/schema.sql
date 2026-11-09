--
-- PostgreSQL database dump
--

\restrict TNEAylWvkykCYS7NzJZqaqwCgiueN0kuWJdnYe8wMbohxwThN1hIqb3OkILEP0e

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

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
-- Name: Category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Category" AS ENUM (
    'Housekeeping',
    'Maintenance',
    'RoomService',
    'FrontOffice',
    'Other',
    'Safety',
    'Food'
);


ALTER TYPE public."Category" OWNER TO postgres;

--
-- Name: Priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Priority" AS ENUM (
    'Low',
    'Medium',
    'High'
);


ALTER TYPE public."Priority" OWNER TO postgres;

--
-- Name: RequestStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RequestStatus" AS ENUM (
    'Pending',
    'Assigned',
    'InProgress',
    'Resolved',
    'Closed'
);


ALTER TYPE public."RequestStatus" OWNER TO postgres;

--
-- Name: RequestType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RequestType" AS ENUM (
    'ServiceRequest',
    'Complaint'
);


ALTER TYPE public."RequestType" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'Admin',
    'Manager',
    'Staff'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: RequestHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RequestHistory" (
    id integer NOT NULL,
    "requestId" integer NOT NULL,
    "previousStatus" public."RequestStatus" NOT NULL,
    "newStatus" public."RequestStatus" NOT NULL,
    remarks text,
    "updatedById" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."RequestHistory" OWNER TO postgres;

--
-- Name: RequestHistory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."RequestHistory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."RequestHistory_id_seq" OWNER TO postgres;

--
-- Name: RequestHistory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."RequestHistory_id_seq" OWNED BY public."RequestHistory".id;


--
-- Name: ServiceRequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ServiceRequest" (
    id integer NOT NULL,
    "ticketId" text NOT NULL,
    "roomNumber" text NOT NULL,
    category public."Category" NOT NULL,
    "requestType" public."RequestType" NOT NULL,
    description text NOT NULL,
    priority public."Priority" DEFAULT 'Low'::public."Priority" NOT NULL,
    status public."RequestStatus" DEFAULT 'Pending'::public."RequestStatus" NOT NULL,
    "assignedDepartment" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "assignedToStaff" text,
    "escalationReason" text,
    "isEscalated" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."ServiceRequest" OWNER TO postgres;

--
-- Name: ServiceRequest_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ServiceRequest_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ServiceRequest_id_seq" OWNER TO postgres;

--
-- Name: ServiceRequest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ServiceRequest_id_seq" OWNED BY public."ServiceRequest".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'Staff'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    phone text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: RequestHistory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestHistory" ALTER COLUMN id SET DEFAULT nextval('public."RequestHistory_id_seq"'::regclass);


--
-- Name: ServiceRequest id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ServiceRequest" ALTER COLUMN id SET DEFAULT nextval('public."ServiceRequest_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: RequestHistory RequestHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestHistory"
    ADD CONSTRAINT "RequestHistory_pkey" PRIMARY KEY (id);


--
-- Name: ServiceRequest ServiceRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ServiceRequest"
    ADD CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: ServiceRequest_ticketId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ServiceRequest_ticketId_key" ON public."ServiceRequest" USING btree ("ticketId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: RequestHistory RequestHistory_requestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestHistory"
    ADD CONSTRAINT "RequestHistory_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES public."ServiceRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RequestHistory RequestHistory_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestHistory"
    ADD CONSTRAINT "RequestHistory_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict TNEAylWvkykCYS7NzJZqaqwCgiueN0kuWJdnYe8wMbohxwThN1hIqb3OkILEP0e

