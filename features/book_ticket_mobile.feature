Feature: Book a ticket with a *showoff* mobile device
    Scenario: Should NOT book a standard ticket with iPhone *goat* SE
        Given user goes to homepage "/client/index.php" emulated for specified device - 4
        When user selects 2 days after current - 4
        When selects standard hall number 2 - 4
        Then the 'Book' button is not in viewport - 4