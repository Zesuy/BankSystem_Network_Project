import java.net.*;
import java.io.*;
import java.util.*;
import com.google.gson.*;
import com.google.gson.reflect.TypeToken;

class ClientHandler implements Runnable {
    private static final String ACCOUNT_FILE = "src/main/resources/accounts.json";
    private static final String TRANSACTION_LOG = "transactions.log";
    private static final String DEBUG_LOG = "debug.log";
    private static final String INFO_LOG = "info.log";
    
    private final Socket clientSocket;
    private Map<String, Account> accounts;
    private Account currentAccount;

    public ClientHandler(Socket socket) {
        this.clientSocket = socket;
        this.accounts = loadAccounts();
    }

    public void run() {
        try (BufferedReader in = new BufferedReader(
                new InputStreamReader(clientSocket.getInputStream()));
             PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true)) {
            
            String inputLine;
            while ((inputLine = in.readLine()) != null) {
                String response = processCommand(inputLine);
                out.println(response);
                
                if ("BYE".equals(inputLine)) break;
            }
        } catch (IOException e) {
            logError("Connection error: " + e.getMessage());
        } finally {
            try { clientSocket.close(); } catch (IOException e) {}
        }
    }

    private String processCommand(String command) {
        String[] parts = command.split(" ");
        try {
            switch (parts[0]) {
                case "HELO":
                    return handleHelo(parts[1]);
                case "PASS":
                    return handlePass(parts[1]);
                case "BALA":
                    return handleBalance();
                case "WDRA":
                    return handleWithdrawal(parts[1]);
                case "BYE":
                    return "BYE";
                default:
                    return "401 ERROR";
            }
        } catch (Exception e) {
            logError("Command processing error: " + command);
            return "401 ERROR";
        }
    }

    private String handleHelo(String cardNo) {
        currentAccount = accounts.get(cardNo);
        return (currentAccount != null) ? "500 AUTH REQUIRED" : "401 ERROR";
    }

    private String handlePass(String password) {
        if (currentAccount != null && currentAccount.verifyPassword(password)) {
            logTransaction(currentAccount.cardNo, "AUTH", "SUCCESS");
            return "525 OK";
        }
        logTransaction(currentAccount.cardNo, "AUTH", "FAIL");
        return "401 ERROR";
    }

    private String handleBalance() {
        return (currentAccount != null) ? 
            "AMNT:" + currentAccount.balance : "401 ERROR";
    }

    private synchronized String handleWithdrawal(String amountStr) {
        try {
            int amount = Integer.parseInt(amountStr);
            // 检查取款金额是否为负数
            if (amount < 0) {
                logTransaction(currentAccount.cardNo, "WDRA", "FAIL", amount);
                return "401 ERROR";
            }
            if (currentAccount != null && currentAccount.withdraw(amount)) {
                saveAccounts();
                logTransaction(currentAccount.cardNo, "WDRA", "SUCCESS", amount);
                return "525 OK";
            }
            logTransaction(currentAccount.cardNo, "WDRA", "FAIL", amount);
            return "401 ERROR";
        } catch (NumberFormatException e) {
            return "401 ERROR";
        }
    }

    private Map<String, Account> loadAccounts() {
        try (Reader reader = new FileReader(ACCOUNT_FILE)) {
            return new Gson().fromJson(reader, 
                new TypeToken<Map<String, Account>>(){}.getType());
        } catch (IOException e) {
            logError("Failed to load accounts: " + e.getMessage());
            return new HashMap<>();
        }
    }

    private synchronized void saveAccounts() {
        try (Writer writer = new FileWriter(ACCOUNT_FILE)) {
            new Gson().toJson(accounts, writer);
        } catch (IOException e) {
            logError("Failed to save accounts: " + e.getMessage());
        }
    }

   private void logTransaction(String cardNo, String action, String status, int... amount) {
        String log = String.format("%s | %s | %s | %s | %d",
            new Date(), cardNo, action, status, 
            (amount.length > 0) ? amount[0] : 0);
        
        // INFO级别日志
        logInfo("[TRANSACTION] " + log);
        
        try (PrintWriter pw = new PrintWriter(
                new FileWriter(TRANSACTION_LOG, true))) {
            pw.println(log);
        } catch (IOException e) {
            logError("Failed to write transaction log: " + log);
        }
    }

    private void logError(String message) {
        String log = new Date() + " | " + message;
        logDebug("[ERROR] " + log);
        
        try (PrintWriter pw = new PrintWriter(
                new FileWriter("errors.log", true))) {
            pw.println(log);
        } catch (IOException e) {
            System.err.println("Failed to write error log: " + message);
        }
    }

    // 新增INFO级别日志方法
    private void logInfo(String message) {
        String log = new Date() + " | INFO | " + message;
        System.out.println(log);
        
        try (PrintWriter pw = new PrintWriter(
                new FileWriter(INFO_LOG, true))) {
            pw.println(log);
        } catch (IOException e) {
            System.err.println("Failed to write info log: " + message);
        }
    }

    // 新增DEBUG级别日志方法
    private void logDebug(String message) {
        String log = new Date() + " | DEBUG | " + message;
        System.out.println(log);
        
        try (PrintWriter pw = new PrintWriter(
                new FileWriter(DEBUG_LOG, true))) {
            pw.println(log);
        } catch (IOException e) {
            System.err.println("Failed to write debug log: " + message);
        }
    }
}
