using System;
using System.Threading.Tasks;
using ClinicManagement.Application.Features.LuotKham.Commands;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers
{
    public partial class LuotKhamController : BaseController
    {
        [HttpPost("{id}/start-exam")]
        public async Task<IActionResult> StartExam(int id)
        {
            try
            {
                var command = new StartExamCommand
                {
                    Id = id,
                    MaBacSi = CurrentUserId
                };

                var result = await _mediator.Send(command);
                return Success(result, "Bắt đầu khám thành công");
            }
            catch (KeyNotFoundException ex)
            {
                return Failure(ex.Message, 404);
            }
            catch (InvalidOperationException ex)
            {
                return Failure(ex.Message, ex.Message.Contains("đang được khám", StringComparison.OrdinalIgnoreCase) ? 409 : 400);
            }
            catch (ArgumentException ex)
            {
                return Failure(ex.Message, 400);
            }
        }
    }
}
