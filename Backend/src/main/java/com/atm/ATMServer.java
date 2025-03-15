import java.net.*;
import java.io.*;
import java.util.concurrent.*;

public class ATMServer {
    private static final int PORT = 2525;
    private static final int MAX_THREADS = 10;

    public static void main(String[] args) {
        ExecutorService pool = Executors.newFixedThreadPool(MAX_THREADS);
        
        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            System.out.println("ATM Server started on port " + PORT);
            
            while (true) {
                Socket clientSocket = serverSocket.accept();
                pool.execute(new ClientHandler(clientSocket));
            }
        } catch (IOException e) {
            System.err.println("Server exception: " + e.getMessage());
        }
    }
}
