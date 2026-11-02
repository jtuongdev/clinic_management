using ClinicManagement.Domain.Patient;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Infrastructure.Persistence;
using ClinicManagement.Infrastructure.Persistence.Repositories;
using ClinicManagement.Domain.Common.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClinicManagement.Domain.Examination;   
using ClinicManagement.Domain.Prescription;    
using ClinicManagement.Domain.Service;        
using ClinicManagement.Domain.Billing;  

namespace ClinicManagement.Infrastructure.Persistence.Repositories
{
    public partial class BenhNhanRepository : Repository<BenhNhan>, IBenhNhanRepository
    {


    }
}