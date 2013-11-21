using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Kendo_deail_grid.Controllers
{
    public class TimeEntry
    {
        public Guid Id
        {
            get
            {
                return Guid.NewGuid();
            }
        }
        public TimeEntry()
        {
            
            

        }

        public IEnumerable<object> StatusEntries { get; set; }
    }
}
