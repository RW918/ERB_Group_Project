# JobTrack

A job-application tracker for individual job seekers, with a career-centre mode in which a privileged user can see every user's applications and manage who holds which role.

## Language

### The job search

**Application**:
One user's pursuit of one position at one company, from submission to outcome.
_Avoid_: job, posting, record, entry, lead

**Position**:
The job title applied for, recorded as free text on the application.
_Avoid_: job, job description, role, title

**Company**:
An organisation that applications are directed at. Shared across users — two users applying to the same company reference the same company.
_Avoid_: employer, firm, organisation, client

**Status**:
The stage an application has reached. Exactly one of: `applied` (submitted, no response yet), `interviewing` (an interview is scheduled or has happened), `offer` (an offer was received), `rejected` (closed without an offer).
_Avoid_: stage, state, progress, phase

**Interview date**:
The date of the next interview for an application. Empty when no interview is scheduled; independent of status.
_Avoid_: meeting, appointment

**Posting URL**:
The address of the original job advertisement for an application. Each user keeps their own; postings are not a shared entity.
_Avoid_: link, reference, source

**Deadline**:
The date by which an application must be submitted. Independent of the interview date and of status.
_Avoid_: due date, expiry, closing date

### Access

**User**:
A person with an account in JobTrack. Owns the applications they create.
_Avoid_: account, member, job seeker, applicant

**Role**:
A named bundle of permissions. Exactly two exist — `user` and `admin` — and every user holds exactly one.
_Avoid_: user type, level, group, permission

**Permission**:
A switch belonging to a role that allows one action across all users' data. Currently `can_view_all_applications` and `can_manage_users`.
_Avoid_: right, privilege, scope, grant (as a noun)

**Grant**:
Assigning a role to a user, which confers that role's permissions from that moment. Revoking is the inverse.
_Avoid_: authorise, allow, assign, permission (as a verb)

**Admin**:
A user holding the `admin` role.
_Avoid_: superuser, owner, staff

**Ownership**:
The link between a user and the applications they created. It alone decides who may edit or delete an application; no role overrides it.
_Avoid_: author, creator, assignee
