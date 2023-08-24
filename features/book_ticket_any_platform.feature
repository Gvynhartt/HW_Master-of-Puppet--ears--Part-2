Feature: Book a ticket on any platform
    Scenario: Should book a standard ticket (Happy Path #1)
        Given user is on homepage "/client/index.php" 1
        When user selects 3 days after current 1
        When selects a random standard hall 1
        When selects a random standard seat 1
        When submits selection with 'Book' button 1
        When proceeds to payment page and sees ticket details 1
        When presses 'receive order QR code' button 1
        Then user sees specified text in 'ticket hint' section 1

    Scenario: Should book a VIP ticket (Happy Path #2)
        Given user is on homepage "/client/index.php" 2
        When user selects 1 day from current 2
        When selects a random VIP hall 2
        When selects a random VIP seat 2
        When submits selection with 'Book' button 2
        When proceeds to payment page and sees ticket details 2
        When presses 'receive order QR code' button 2
        Then user sees specified text in 'ticket hint' section 2

    Scenario: Should NOT re-book an already booked seat (Sad Path #1)
        Given user is on homepage "/client/index.php" - 3
        When user selects 2 days after current - 3
        When selects standard hall number 3 - 3
        When selects standard seat number 58 - 3
        When submits selection with 'Book' button - 3
        When proceeds to payment page and sees ticket details - 3
        When presses 'receive order QR code' button - 3
        Then user sees specified text in 'ticket hint' section - 3

        When user goes back to homepage "/client/index.php" - 3
        When selects the same hall - 3
        Then sees a selected seat element in the scheme - 3
        When clicks on the same seat number 58 - 3
        Then finds out that 'Book' button is not clickable - 3
