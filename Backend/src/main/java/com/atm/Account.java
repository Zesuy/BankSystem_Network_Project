public class Account {
    public String cardNo;
    private String password;
    public int balance;

    public boolean verifyPassword(String input) {
        return this.password.equals(input);
    }

    public boolean withdraw(int amount) {
        if (balance >= amount) {
            balance -= amount;
            return true;
        }
        return false;
    }
}
