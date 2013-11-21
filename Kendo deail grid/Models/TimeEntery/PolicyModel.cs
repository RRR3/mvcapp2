using System;
using System.Collections.Generic;

namespace Kendo_deail_grid.Models.TimeEntery
{
    /// <summary>
    /// Holds the policy information
    /// </summary>
    public class PolicyModel
    {
        //#region Public properties

        public Guid Id
        {
            get { return Guid.NewGuid(); }
        }

        //public string Name
        //{
        //    get { return Policy.Name; }
        //}

        //public bool IsDefaultPolicy
        //{
        //    get { return Policy.IsDefaultPolicy; }
        //}

        //public List<PayKindModel> PayKinds { get { return _payKinds; } }

        //public WorkPeriodType PeriodType
        //{
        //    get { return Policy.PeriodType; }
        //}

        //public TimeEntryType EntryType
        //{
        //    get { return Policy.EntryType; }
        //}

        //public bool RequireTimeSupervisorApproval
        //{
        //    get { return Policy.RequireTimeSupervisorApproval; }
        //}

        //public bool RequireProjectManagerApproval
        //{
        //    get { return Policy.RequireProjectManagerApproval; }
        //}

        //public DayOfWeek WeekStartsOnDay { get { return Policy.PeriodStartDayOfWeek; } }

        //public DateTime? YearStartDate
        //{
        //    get { return Policy.YearStartDate; }
        //}

        //public DateTime CurrentPeriodStartDate
        //{
        //    get { return Policy.CurrentPeriodStartDate; }
        //}

        //public DateTime CurrentPeriodEndDate
        //{
        //    get { return Policy.CurrentPeriodEndDate; }
        //}

        //public TimeSpan? WorkDayStartTime
        //{
        //    get { return Policy.WorkDayStartTime; }
        //}

        //public TimeSpan? WorkDayEndTime
        //{
        //    get { return Policy.WorkDayEndTime; }
        //}

        //public int? FirstDayOfMonth
        //{
        //    get { return Policy.FirstDayOfMonth; }
        //}

        //public int? SecondDayOfMonth
        //{
        //    get { return Policy.SecondDayOfMonth; }
        //}

        //public int? MaximumWeeklyMinutes
        //{
        //    get { return Policy.MaximumWeeklyMinutes; }
        //}

        //public short EntryMinuteIntervals
        //{
        //    get { return Policy.EntryMinuteIntervals; }
        //}

        //#endregion

        //#region Private properties
        
        //private Policy Policy { get; set; }

        //private List<PayKindModel> _payKinds { get; set; }

        //#endregion

        //#region Constructor
        
        ///// <summary>
        ///// Constructor
        ///// </summary>
        ///// <param name="policy"></param>
        //public PolicyModel(Policy policy)
        //{
        //    Policy = policy;
        //    _payKinds = policy.PayKinds.Select(payKind => new PayKindModel(payKind)).ToList();
            
        //}

        //#endregion

       
    }
}