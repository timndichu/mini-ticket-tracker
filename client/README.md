# Mini Ticket Tracker Frontend

## Component	Responsibility
DashboardHeader	Application branding and refresh button
TicketStats	Display the four summary cards
TicketFilters	Display the status filter and ticket count
TicketTable	Render ticket rows and loading, error, and empty states
Pagination	Handle previous/next navigation
StatusBadge	Display a ticket's status consistently
PriorityBadge	Display a ticket's priority consistently

App.tsx responsible for coordinating the page: fetching tickets and statistics, holding shared state, and passing data and callbacks to components