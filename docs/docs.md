# RFC-20232023

## 1. Messages from ATM to Server

| Msg Name | Purpose |
|----------|---------|
| `HELO sp <userid>` | Let server know that there is a card in the ATM machine. ATM transmits user ID (cardNo.) to Server. |
| `PASS sp <passwd>` | User enters PIN (password), which is sent to server. |
| `BALA` | User requests balance. |
| `WDRA sp <amount>` | User asks to withdraw money. |
| `BYE` | User is done. |

## 2. Messages from Server to ATM

| Msg Name | Purpose |
|----------|---------|
| `500 sp AUTH REQUIRE` | Ask user for PIN (password). |
| `525 sp OK!` | Requested operation (PASSWD, WITHDRAWL) is OK. |
| `401 sp ERROR!` | Requested operation (PASSWD, WITHDRAWL) is in ERROR. |
| `AMNT:<amnt>` | Sent in response to BALANCE request. |
| `BYE` | User done, display welcome screen at ATM. |

## 3. Interaction between ATM and Server

```
Client                                          Server
HELO <userid>   --------------> (check if valid userid)
                <-------------  500 sp AUTH REQUIRED!
PASS <passwd>   --------------> (check password)
                <-------------  525 OK! (//password is OK)
BALA                     --------------> (check balance from database)
                <-------------  AMNT:<amnt>
WDRA <amnt>      --------------> (check if enough money to cover withdrawal)
                <-------------   525 OK (if enough, update database)
(ATM dispenses)
                <-------------  401 sp ERROR! (else)
BYE                       -------------->
                <-------------  BYE
```

## 4. Server Port Number

- **Port Number:** `2525`

## Remarks

1. The Protocol only defines Messages and Interactions between ATM and Server. Typically, users need an interface or agent (which will be developed by software engineers and employed on ATM) to interact with ATM. Moreover, there should also be a server program to deal with users' accounts and balance with respect to ATM requests.

2. In the next mission, the students should make the protocol better to work. The students may refer to the FTP protocol (RFC959) to get useful clues. Besides, the students should code the programs both on ATM and Server, to train their TCP socket programming skills.

3. The programs may be coded with any language that the students are familiar with. But the heterogeneous programs on ATM and Server should interact properly.
