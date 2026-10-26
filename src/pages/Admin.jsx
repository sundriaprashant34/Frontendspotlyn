import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import StatCard from '../components/StatCard';
import { STAFF_DESIGNATIONS, staffEmailCandidate } from '../utils/staff.js';

export default function Admin() {
  const location = useLocation();
  const complaintsPage = location.pathname === '/admin/complaints';
  const lostFoundPage = location.pathname === '/admin/lost-found';
  const staffPage = location.pathname === '/admin/staff';
  const studentsPage = location.pathname === '/admin/students';
  const [stats, setStats] = useState({});
  const [items, setItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [staffForm, setStaffForm] = useState({ name: '', staffDesignation: '', password: '' });
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffError, setStaffError] = useState('');
  const [staffMessage, setStaffMessage] = useState('');
  const [savingStaff, setSavingStaff] = useState(false);
  const [selection, setSelection] = useState({});
  const [students, setStudents] = useState([]);
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentError, setStudentError] = useState('');
  const [savingStudent, setSavingStudent] = useState(false);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [lostFoundType, setLostFoundType] = useState('lost');
  const [lostFoundError, setLostFoundError] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState('');
  const [complaintDetail, setComplaintDetail] = useState(null);
  const [complaintDetailLoading, setComplaintDetailLoading] = useState(false);
  const [complaintDetailError, setComplaintDetailError] = useState('');

  const load = async () => {
    const [statsRes, complaintsRes, staffRes] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/complaints'),
      api.get('/users/staff'),
    ]);
    setStats(statsRes.data);
    setItems(complaintsRes.data);
    setStaff(staffRes.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  useEffect(() => {
    if (location.pathname === '/admin/students') {
      openStudents();
    } else {
      setStudentsOpen(false);
      setEditingStudent(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!lostFoundPage) return;
    Promise.all([api.get('/lost-found/lost'), api.get('/lost-found/found')])
      .then(([lostResponse, foundResponse]) => {
        setLostItems(lostResponse.data);
        setFoundItems(foundResponse.data);
        setLostFoundError('');
      })
      .catch((error) => {
        setLostFoundError(error.response?.data?.message || 'Could not load item reports');
      });
  }, [lostFoundPage]);

  const verify = async (id, approve) => {
    await api.put(`/complaints/${id}/verify`, { approve });
    await load();
  };

  const assign = async (id) => {
    if (!selection[id]) return;
    await api.put(`/complaints/${id}/assign`, { staffId: selection[id] });
    await load();
  };

  const openComplaintDetails = async (id) => {
    setComplaintDetail(null);
    setComplaintDetailError('');
    setComplaintDetailLoading(true);
    try {
      const response = await api.get(`/complaints/${id}`);
      setComplaintDetail(response.data);
    } catch (error) {
      setComplaintDetailError(error.response?.data?.message || 'Could not load complaint details');
    } finally {
      setComplaintDetailLoading(false);
    }
  };

  const createStaff = async (event) => {
    event.preventDefault();
    setSavingStaff(true);
    setStaffError('');
    setStaffMessage('');
    try {
      const payload = { ...staffForm };
      if (!payload.password) delete payload.password;
      const response = editingStaff
        ? await api.put(`/users/staff/${editingStaff._id}`, payload)
        : await api.post('/users/staff', payload);
      setStaff((current) =>
        editingStaff
          ? current.map((member) => (member._id === response.data._id ? response.data : member))
          : [response.data, ...current]
      );
      setStaffMessage(
        editingStaff
          ? `Staff account updated: ${response.data.email}`
          : `Staff account created: ${response.data.email}`
      );
      setEditingStaff(null);
      setStaffForm({ name: '', staffDesignation: '', password: '' });
    } catch (error) {
      setStaffError(
        error.response?.data?.message ||
          `Could not ${editingStaff ? 'update' : 'create'} staff account`
      );
    } finally {
      setSavingStaff(false);
    }
  };

  const editStaff = (member) => {
    setEditingStaff(member);
    setStaffForm({ name: member.name, staffDesignation: member.staffDesignation, password: '' });
    setStaffError('');
    setStaffMessage('');
  };

  const deleteStaff = async (member) => {
    if (!window.confirm(`Deactivate ${member.name}'s staff account?`)) return;
    setStaffError('');
    setStaffMessage('');
    try {
      await api.delete(`/users/staff/${member._id}`);
      setStaff((current) => current.filter((item) => item._id !== member._id));
      if (editingStaff?._id === member._id) {
        setEditingStaff(null);
        setStaffForm({ name: '', staffDesignation: '', password: '' });
      }
      setStaffMessage(`${member.name}'s account was deactivated.`);
    } catch (error) {
      setStaffError(error.response?.data?.message || 'Could not deactivate staff account');
    }
  };

  const openStudents = async () => {
    setStudentsOpen(true);
    setStudentError('');
    try {
      const response = await api.get('/users/students');
      setStudents(response.data);
    } catch (error) {
      setStudentError(error.response?.data?.message || 'Could not load students');
    }
  };

  const saveStudent = async (event) => {
    event.preventDefault();
    setSavingStudent(true);
    setStudentError('');
    try {
      const response = await api.put(`/users/students/${editingStudent._id}`, editingStudent);
      setStudents((current) =>
        current.map((student) => (student._id === response.data._id ? response.data : student))
      );
      setEditingStudent(null);
    } catch (error) {
      setStudentError(error.response?.data?.message || 'Could not update student');
    } finally {
      setSavingStudent(false);
    }
  };

  const deleteStudent = async (student) => {
    if (!window.confirm(`Delete ${student.name}'s account?`)) return;
    try {
      await api.delete(`/users/students/${student._id}`);
      setStudents((current) => current.filter((item) => item._id !== student._id));
      setStats((current) => ({ ...current, students: Math.max(0, (current.students || 0) - 1) }));
      if (editingStudent?._id === student._id) setEditingStudent(null);
      setStudentError('');
    } catch (error) {
      setStudentError(error.response?.data?.message || 'Could not delete student');
    }
  };

  const updateLostFoundStatus = async (itemId, status) => {
    setUpdatingItemId(itemId);
    setLostFoundError('');
    try {
      const response = await api.put(`/lost-found/${lostFoundType}/${itemId}/status`, { status });
      const updateItems = lostFoundType === 'lost' ? setLostItems : setFoundItems;
      updateItems((current) => current.map((item) => (item._id === itemId ? response.data : item)));
    } catch (error) {
      setLostFoundError(error.response?.data?.message || 'Could not update item report');
    } finally {
      setUpdatingItemId('');
    }
  };

  if (lostFoundPage) {
    const reportItems = lostFoundType === 'lost' ? lostItems : foundItems;
    return (
      <section>
        <div className="mb-6">
          <h1 className="page-title">Lost &amp; Found Reports</h1>
          <p className="section-sub">Review item reports and update their resolution status.</p>
        </div>
        <div className="flex gap-2 border-b border-slate-200 mb-5">
          {['lost', 'found'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setLostFoundType(type)}
              className={`px-4 py-3 text-sm font-semibold capitalize border-b-2 ${lostFoundType === type ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              {type} Items ({type === 'lost' ? lostItems.length : foundItems.length})
            </button>
          ))}
        </div>
        {lostFoundError && (
          <p role="alert" className="card mb-4 bg-red-50 text-sm text-red-700">
            {lostFoundError}
          </p>
        )}
        <div className="card">
          <table className="mobile-card-table w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-3 pr-4">Item</th>
                <th className="pr-4">Photo</th>
                <th className="pr-4">Category / Location</th>
                <th className="pr-4">Reported by</th>
                <th className="pr-4">Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportItems.map((item) => (
                <tr key={item._id} className="border-b last:border-0 align-top">
                  <td className="py-4 pr-4" data-label="Item">
                    <div className="font-semibold">{item.itemName}</div>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">{item.description}</p>
                    )}
                  </td>
                  <td className="pr-4" data-label="Photo">
                    {item.image ? (
                      <a href={item.image} target="_blank" rel="noreferrer">
                        <img
                          src={item.image}
                          alt={`Reported ${lostFoundType} item: ${item.itemName}`}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">No photo</span>
                    )}
                  </td>
                  <td className="pr-4" data-label="Category / Location">
                    {item.category}
                    <div className="text-xs text-slate-500 mt-1">
                      {item.location || 'No location'}
                    </div>
                  </td>
                  <td className="pr-4" data-label="Reported by">
                    {item.reporter?.name || 'Unknown'}
                  </td>
                  <td className="pr-4" data-label="Date">
                    {item.date ? new Date(item.date).toLocaleDateString() : 'Not provided'}
                  </td>
                  <td data-label="Status">
                    <select
                      className="field min-w-36"
                      aria-label={`Status for ${item.itemName}`}
                      value={item.status}
                      disabled={updatingItemId === item._id}
                      onChange={(event) => updateLostFoundStatus(item._id, event.target.value)}
                    >
                      {['Open', 'Matched', 'Resolved'].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reportItems.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">
              No {lostFoundType} item reports.
            </p>
          )}
        </div>
      </section>
    );
  }

  if (staffPage) {
    const designation = STAFF_DESIGNATIONS.find(
      (item) => item.title === staffForm.staffDesignation
    );
    const occupiedStaffEmails = new Set(
      staff
        .filter((member) => member._id !== editingStaff?._id)
        .map((member) => member.email.toLowerCase())
    );
    let loginId = '';
    if (designation) {
      if (editingStaff?.staffDesignation === designation.title) {
        loginId = editingStaff.email;
      } else {
        for (let attempt = 0; ; attempt += 1) {
          const candidate = staffEmailCandidate(designation.title, staffForm.name, attempt);
          if (!occupiedStaffEmails.has(candidate)) {
            loginId = candidate;
            break;
          }
        }
      }
    }
    return (
      <section>
        <div className="mb-6">
          <h1 className="page-title">Staff Management</h1>
          <p className="section-sub">Create staff accounts and view their login IDs.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <form onSubmit={createStaff} className="card space-y-4">
            <h2 className="section-title">{editingStaff ? 'Edit Staff' : 'Add Staff'}</h2>
            {staffError && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {staffError}
              </p>
            )}
            {staffMessage && (
              <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {staffMessage}
              </p>
            )}
            <label className="block text-sm font-medium">
              Full name
              <input
                className="field mt-1"
                value={staffForm.name}
                onChange={(event) =>
                  setStaffForm((current) => ({ ...current, name: event.target.value }))
                }
                autoComplete="name"
                required
              />
            </label>
            <label className="block text-sm font-medium">
              Designation
              <select
                className="field mt-1"
                value={staffForm.staffDesignation}
                onChange={(event) =>
                  setStaffForm((current) => ({ ...current, staffDesignation: event.target.value }))
                }
                required
              >
                <option value="">Select designation</option>
                {STAFF_DESIGNATIONS.map((item) => (
                  <option key={item.title} value={item.title}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Generated login ID
              <input
                className="field mt-1"
                value={loginId}
                placeholder="Select a designation"
                readOnly
              />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input
                className="field mt-1"
                type="password"
                value={staffForm.password}
                onChange={(event) =>
                  setStaffForm((current) => ({ ...current, password: event.target.value }))
                }
                autoComplete="new-password"
                minLength={8}
                required={!editingStaff}
                placeholder={editingStaff ? 'Leave blank to keep current password' : ''}
              />
            </label>
            <div className="flex gap-2">
              <button
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                disabled={savingStaff}
              >
                {savingStaff ? 'Saving...' : editingStaff ? 'Save changes' : 'Create staff account'}
              </button>
              {editingStaff && (
                <button
                  type="button"
                  className="rounded-lg border px-4 py-2.5 text-sm"
                  onClick={() => {
                    setEditingStaff(null);
                    setStaffForm({ name: '', staffDesignation: '', password: '' });
                    setStaffError('');
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          <div className="card">
            <h2 className="section-title">Staff Accounts</h2>
            <div className="mt-4 divide-y">
              {staff.map((member) => (
                <div key={member._id || member.email} className="py-3 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{member.name}</div>
                      <div className="text-sm text-slate-600">{member.email}</div>
                      <div className="text-xs text-slate-500">
                        {member.staffDesignation || member.staffDepartment}
                        {member.staffDesignation && member.staffDepartment
                          ? ` · ${member.staffDepartment}`
                          : ''}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        className="rounded-md px-2 py-1 text-sm text-blue-700 hover:bg-blue-50"
                        onClick={() => editStaff(member)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-md px-2 py-1 text-sm text-red-700 hover:bg-red-50"
                        onClick={() => deleteStaff(member)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {staff.length === 0 && (
                <p className="py-6 text-sm text-slate-500">No staff accounts yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="page-title">
          {studentsPage ? 'Students' : complaintsPage ? 'All Complaints' : 'Admin Dashboard'}
        </h1>
        <p className="section-sub">
          {studentsPage
            ? `${students.length} active students.`
            : complaintsPage
              ? `${items.length} complaints submitted across the campus.`
              : 'Manage college complaints, staff assignments, and system activity.'}
        </p>
      </div>

      {!complaintsPage && !studentsPage && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button type="button" onClick={openStudents} className="text-left">
            <StatCard icon="🎓" label="Students" value={stats.students || 0} />
          </button>
          <StatCard icon="🧾" label="Complaints" value={stats.totalComplaints || 0} />
          <StatCard icon="⏳" label="Pending" value={stats.pending || 0} />
          <StatCard icon="🎯" label="Resolved" value={stats.resolved || 0} />
          <StatCard icon="🔧" label="In Progress" value={stats.inProgress || 0} />
          <StatCard icon="📦" label="Lost Items" value={stats.lost || 0} />
          <StatCard icon="🔎" label="Found Items" value={stats.found || 0} />
          <StatCard icon="🚨" label="Emergency" value={stats.emergency || 0} />
        </div>
      )}

      {studentsPage && studentsOpen && (
        <div className="card mt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="section-title">Student Management</h2>
              <p className="section-sub">View, edit, or remove student accounts.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setStudentsOpen(false);
                setEditingStudent(null);
              }}
              className="px-3 py-2 rounded-lg border text-sm"
            >
              Close
            </button>
          </div>

          {studentError && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {studentError}
            </p>
          )}

          {editingStudent && (
            <form onSubmit={saveStudent} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <input
                className="field"
                aria-label="Student name"
                value={editingStudent.name || ''}
                onChange={(event) =>
                  setEditingStudent({ ...editingStudent, name: event.target.value })
                }
                required
              />
              <input
                className="field"
                type="email"
                aria-label="Student email"
                value={editingStudent.email || ''}
                onChange={(event) =>
                  setEditingStudent({ ...editingStudent, email: event.target.value })
                }
                required
              />
              <input
                className="field"
                aria-label="Student phone"
                value={editingStudent.phone || ''}
                onChange={(event) =>
                  setEditingStudent({ ...editingStudent, phone: event.target.value })
                }
              />
              <input
                className="field"
                aria-label="Student department"
                value={editingStudent.department || ''}
                onChange={(event) =>
                  setEditingStudent({ ...editingStudent, department: event.target.value })
                }
              />
              <div className="sm:col-span-2 lg:col-span-4 flex gap-2">
                <button
                  disabled={savingStudent}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
                >
                  {savingStudent ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-lg border text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto mt-4">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-3">Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.phone || '—'}</td>
                    <td>{student.department || '—'}</td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setStudentError('');
                          setEditingStudent({ ...student });
                        }}
                        className="px-3 py-1.5 text-blue-700 hover:bg-blue-50 rounded-md"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteStudent(student)}
                        className="ml-1 px-3 py-1.5 text-red-700 hover:bg-red-50 rounded-md"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">No active students found.</p>
            )}
          </div>
        </div>
      )}

      {!studentsPage && (
        <div className="card mt-6">
          <h2 className="section-title">
            {complaintsPage ? 'All Complaints' : 'Complaint Management'}
          </h2>
          <div className="overflow-x-auto mt-4">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-3">ID</th>
                  <th>Complaint</th>
                  <th>Student</th>
                  <th>Status</th>
                  <th>Details</th>
                  <th>Assign</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((complaint) => (
                  <tr key={complaint._id} className="border-b last:border-0">
                    <td className="py-4 font-semibold">{complaint.complaintId}</td>
                    <td>
                      {complaint.title}
                      <div className="text-xs text-slate-400">
                        {complaint.building} / {complaint.room}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium">
                        {complaint.student?.name || complaint.studentName || 'Name unavailable'}
                      </div>
                      {complaint.student?.email && (
                        <div className="text-xs text-slate-500">{complaint.student.email}</div>
                      )}
                    </td>
                    <td>
                      <span className="badge">{complaint.status}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="text-blue-600 font-semibold whitespace-nowrap"
                        onClick={() => openComplaintDetails(complaint._id)}
                      >
                        View details
                      </button>
                    </td>
                    <td>
                      {complaint.status === 'Verified' && (
                        <>
                          <select
                            className="field min-w-48"
                            value={
                              selection[complaint._id] || complaint.assignedStaff?._id || ''
                            }
                            onChange={(event) =>
                              setSelection({ ...selection, [complaint._id]: event.target.value })
                            }
                          >
                            <option value="">Select staff</option>
                            {staff.map((member) => (
                              <option key={member._id} value={member._id}>
                                {member.name} · {member.staffDesignation || member.staffDepartment}
                                {member.staffDesignation && member.staffDepartment
                                  ? ` (${member.staffDepartment})`
                                  : ''}
                              </option>
                            ))}
                          </select>
                          <button
                            className="text-blue-600 font-semibold mt-1"
                            onClick={() => assign(complaint._id)}
                          >
                            Assign
                          </button>
                        </>
                      )}
                    </td>
                    <td className="space-x-2">
                      {complaint.status === 'Submitted' && (
                        <>
                          <button
                            className="text-green-600 font-semibold"
                            onClick={() => verify(complaint._id, true)}
                          >
                            Approve
                          </button>
                          <button
                            className="text-red-600 font-semibold"
                            onClick={() => verify(complaint._id, false)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {items.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500">No complaints found.</p>
          )}
        </div>
      )}

      {(complaintDetailLoading || complaintDetailError || complaintDetail) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            if (!complaintDetailLoading) {
              setComplaintDetail(null);
              setComplaintDetailError('');
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="complaint-detail-title"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="complaint-detail-title" className="section-title">
                  Complaint details
                </h2>
                {complaintDetail?.complaint && (
                  <p className="mt-1 text-sm text-slate-500">
                    {complaintDetail.complaint.complaintId}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label="Close complaint details"
                className="rounded-lg border px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                onClick={() => {
                  setComplaintDetail(null);
                  setComplaintDetailError('');
                }}
              >
                Close
              </button>
            </div>

            {complaintDetailLoading && (
              <p role="status" className="py-10 text-center text-slate-500">
                Loading complaint details...
              </p>
            )}
            {complaintDetailError && (
              <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {complaintDetailError}
              </p>
            )}
            {complaintDetail?.complaint &&
              (() => {
                const complaint = complaintDetail.complaint;
                const imageUrl = complaint.image
                  ? new URL(complaint.image, new URL(api.defaults.baseURL, window.location.origin))
                      .href
                  : '';
                const details = [
                  ['Category', complaint.category],
                  ['Subcategory', complaint.subcategory],
                  ['Building', complaint.building],
                  ['Floor', complaint.floor],
                  ['Room / Lab', complaint.room],
                  ['Priority', complaint.priority],
                  ['Status', complaint.status],
                  [
                    'Reported on',
                    complaint.createdAt
                      ? new Date(complaint.createdAt).toLocaleString()
                      : 'Not available',
                  ],
                  [
                    'Last updated',
                    complaint.updatedAt
                      ? new Date(complaint.updatedAt).toLocaleString()
                      : 'Not available',
                  ],
                  ['Student', complaint.student?.name || complaint.studentName],
                  ['Student email', complaint.student?.email],
                  ['Assigned department', complaint.assignedDepartment],
                  [
                    'Assigned staff',
                    complaint.assignedStaff
                      ? `${complaint.assignedStaff.name}${complaint.assignedStaff.email ? ` · ${complaint.assignedStaff.email}` : ''}`
                      : '',
                  ],
                  ['Admin remark', complaint.adminRemark],
                  [
                    'Staff decision reason',
                    complaint.staffDecisionReason
                      ? `${complaint.staffDecisionReason}${complaint.staffDecisionDetails ? `: ${complaint.staffDecisionDetails}` : ''}`
                      : '',
                  ],
                  ['Resolution remark', complaint.resolutionRemark],
                ];
                return (
                  <div className="mt-5 space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{complaint.title}</h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {complaint.description || 'No description provided.'}
                      </p>
                    </div>

                    {imageUrl ? (
                      <div>
                        <h3 className="mb-2 font-semibold">Attached photo</h3>
                        <a href={imageUrl} target="_blank" rel="noreferrer">
                          <img
                            src={imageUrl}
                            alt={`Photo attached to ${complaint.title}`}
                            className="max-h-96 w-full rounded-xl border border-slate-200 object-contain bg-slate-50"
                          />
                        </a>
                      </div>
                    ) : (
                      <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                        No photo was attached to this report.
                      </p>
                    )}
                    {complaint.resolutionImage && (
                      <div>
                        <h3 className="mb-2 font-semibold">Resolution photo</h3>
                        <a
                          href={
                            new URL(
                              complaint.resolutionImage,
                              new URL(api.defaults.baseURL, window.location.origin)
                            ).href
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            src={
                              new URL(
                                complaint.resolutionImage,
                                new URL(api.defaults.baseURL, window.location.origin)
                              ).href
                            }
                            alt="Photo attached to the complaint resolution"
                            className="max-h-96 w-full rounded-xl border border-slate-200 object-contain bg-slate-50"
                          />
                        </a>
                      </div>
                    )}

                    <div>
                      <h3 className="mb-3 font-semibold">Report information</h3>
                      <dl className="grid gap-3 sm:grid-cols-2">
                        {details.map(([label, value]) => (
                          <div key={label} className="rounded-lg bg-slate-50 p-3">
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              {label}
                            </dt>
                            <dd className="mt-1 break-words text-sm font-medium text-slate-800">
                              {value || 'Not provided'}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <div>
                      <h3 className="mb-3 font-semibold">Activity history</h3>
                      {complaintDetail.history?.length ? (
                        <div className="space-y-4">
                          {complaintDetail.history.map((entry) => (
                            <div key={entry._id} className="border-l-2 border-blue-500 pl-4">
                              <p className="font-semibold">{entry.action}</p>
                              <p className="text-xs text-slate-500">
                                {new Date(entry.createdAt).toLocaleString()}
                                {entry.performedBy?.name ? ` · ${entry.performedBy.name}` : ''}
                              </p>
                              {entry.remark && (
                                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                                  {entry.remark}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">No activity history available.</p>
                      )}
                    </div>
                  </div>
                );
              })()}
          </section>
        </div>
      )}
    </section>
  );
}
