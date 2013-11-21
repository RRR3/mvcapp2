using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Kendo_deail_grid.Models.TimeEntery;

namespace Kendo_deail_grid.Controllers
{
    public class EnterTimeController
    {
        public ActionResult EnterTime()
        {
            var newModel = new TimeDetailModel();

            newModel.Employee = new EmployeeModel();
            newModel.DefaultStatus = 1;


            newModel.Options = new ControlConfiguration();
            newModel.WeekDays = new List<DateInfo>() {new DateInfo(DateTime.Now)};
            TimeEntry dayEntry = new TimeEntry();
            List<StatusEntryModel> listStatusEntryModel = new List<StatusEntryModel>();

          
            foreach (var statusEntry in dayEntry.StatusEntries)
            {
                listStatusEntryModel.Add(new StatusEntryModel());
            }

            return View(newModel);
        }
    }
}