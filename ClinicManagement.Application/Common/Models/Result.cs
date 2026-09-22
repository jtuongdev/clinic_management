namespace ClinicManagement.Application.Common.Models;

public class Result<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string Message { get; set; } = string.Empty;

    public static Result<T> Ok(T data, string message = "") => new Result<T> { Success = true, Data = data, Message = message };
    public static Result<T> Fail(string message) => new Result<T> { Success = false, Message = message };
}
