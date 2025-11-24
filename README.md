# fineprint-finder
<img src="assets/logo.png" alt="logo" width="100"/>

*For instructions on setting up the web application, check out the readme in the `backend` and `frontend` folders.*

## Information
This project aims to design and implement a proof of concept AI-powered system for regulatory horizon scanning. The solution will perform identification, analysis, and alerting of regulatory changes, with a single upload of a PDF. This enables compliance teams to respond faster, reduce manual workload, and minimize compliance risks. By leveraging LLMs, the system will improve accuracy, provide actionable insights, and support compliance teams in staying ahead of evolving regulations.

## Usage
### Quick Links
- [Login](#login)
- [Adding a new regulation](#adding-a-new-regulation)
- [Compare new version of regulation](#compare-new-version-of-regulation)
- [View and read notifications](#view-and-read-notifications)
- [View and edit change in version comparison](#view-and-edit-change-in-version-comparison)
- [Filter changes across a regulation version comparison](#filter-changes-across-a-regulation-version-comparison)
- [Filter changes across multiple regulations and export to CSV](#filter-changes-across-multiple-regulations-and-export-to-csv)
- [(Admin) Create user](#admin-create-user)
- [(Admin) Edit details of user](#admin-edit-details-of-user)
- [(Admin) Change password of user](#admin-change-password-of-user)
- [(Admin) Delete user](#admin-delete-user)

### Login
1. Input the username and password in their respective fields and click "Login"

    <img src="assets/login.png" />

### Adding a new regulation
1. Click the "Dashboard" tab

    <img src="assets/point_dashboard.png" />
1. Click on "Add New Regulation"

    <img src="assets/point_add_reg.png" />
1. Input the regulation title, version title and upload regulation PDF

    <img src="assets/add_regulation.png" />
1. Click "Add Regulation"

### Compare new version of regulation
1. Click the "Dashboard" tab

    <img src="assets/point_dashboard.png" />
1. If previous version of regulation has not been uploaded yet, [upload](#adding-a-new-regulation) it first
1. Locate the regulation you want to compare in the Regulations list and click it

    <img src="assets/point_example_reg.png" />
1. Input the version title and upload regulation PDF
1. Click "Upload New Version"
1. Wait for the analysis to complete and do not refresh the page. It will take at least a few minutes

    <img src="assets/upload_regulation.png" />

### View and read notifications
1. Click the "Dashboard" tab

    <img src="assets/point_dashboard.png" />
1. Click the notification icon

    <img src="assets/point_notification.png" />
1. If an unread notification exists, click on it to mark it as read

    <img src="assets/notifications.png" />

### View and edit change in version comparison
1. Click the "Dashboard" tab

    <img src="assets/point_dashboard.png" />
1. Locate the regulation you want to view and edit in the Regulations list and click it

    <img src="assets/point_example_reg.png" />
1. Click the "Compare" dropdown and select preferred version, or click "View All Versions (x)" and click "View" on preferred version

    <img src="assets/point_version.png" />
1. Scroll down to "Detailed Changes Analysis"
1. Click toggle arrow on preferred change
1. Click "Edit"

    <img src="assets/point_change_toggle.png" />
1. Edit preferred field(s). Note: Confidence is the percentage of confidence in accuracy of change, according to the LLM
1. Click "Save"

    <img src="assets/point_change_save.png" />

### Filter changes across a regulation version comparison
1. Click the "Dashboard" tab

    <img src="assets/point_dashboard.png" />
1. Locate the regulation you want to view and edit in the Regulations list and click it

    <img src="assets/point_example_reg.png" />
1. Click the "Compare" dropdown and select preferred version, or click "View All Versions (x)" and click "View" on preferred version

    <img src="assets/point_version.png" />
1. Scroll down to "Detailed Changes Analysis"
1. Click "Filter changes" dropdown and select preferred filter

    <img src="assets/filter_dropdown.png" />

### Filter changes across multiple regulations and export to CSV
1. Click the "Changes Overview" tab

    <img src="assets/point_change_overview.png" />
1. Click "Filters" button

    <img src="assets/point_filter.png" />
1. Edit preferred filters, results will appear below the filter options
1. Click the "Export CSV" if needed

    <img src="assets/point_export.png" />

### (Admin) Create user
1. Click the "Admin Panel" tab

    <img src="assets/point_admin_panel.png" />
1. Click on "Create User"

    <img src="assets/point_user_create.png" />
1. Input details of new user
1. Click "Create User"

    <img src="assets/create_user.png" />

### (Admin) Edit details of user
1. Click the "Admin Panel" tab

    <img src="assets/point_admin_panel.png" />
1. Click the edit icon

    <img src="assets/point_user_edit.png" />
1. Input new details of user
1. Click "Save Changes"

    <img src="assets/edit_user.png" />

### (Admin) Change password of user
1. Click the "Admin Panel" tab

    <img src="assets/point_admin_panel.png" />
1. Click the password icon

    <img src="assets/point_user_password.png" />
1. Input new password
1. Click "Reset Password"

    <img src="assets/reset_password.png" />

### (Admin) Delete user
1. Click the "Admin Panel" tab

    <img src="assets/point_admin_panel.png" />
1. Click the delete icon

    <img src="assets/point_user_delete.png" />
1. Click "Delete User"

    <img src="assets/delete_user.png" />
