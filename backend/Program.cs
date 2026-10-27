var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
var app = builder.Build();

app.UseCors("AllowFrontend");
app.MapGet("/",()=> "Calculator API is running!");
app.MapGet("/api/calculator", Calculate);

IResult Calculate(double a, double b, string operation)
{
    double result;

    switch (operation.ToLower())
    {
        case "add":
            result = a + b;
            break;
        case "subtract":
            result = a - b;
            break;    
        case "multiply":
            result = a * b;
            break;
        case "divide":
        if (b == 0)
        {
            return Results.BadRequest("Cannot divide by zero.");
        }
        result = a / b;
        break;
        default:
            return Results.BadRequest("Use add, subtract, multiply, or divide.");
    }
    return Results.Ok(new
    {
        number1 = a,
        number2 = b,
        operation,
        result
    });
}    
app.Run();