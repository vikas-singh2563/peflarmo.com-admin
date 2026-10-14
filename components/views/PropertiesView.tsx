'use client';

import React, { useState } from 'react';
import {
  Search,
  Home,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  X,
  MapPin,
  IndianRupee,
  Shield,
  Layers,
  Bed,
  Check,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';
import { Property, PropertyCategory, PropertyApprovalStatus, PropertyAvailability, Broker } from '@/lib/types';

interface PropertiesViewProps {
  properties: Property[];
  brokers: Broker[];
  onUpdateProperty: (params: {
    id: string;
    approvalStatus?: PropertyApprovalStatus;
    adminFeedback?: string;
    assignedBrokerId?: string;
    availabilityStatus?: PropertyAvailability;
  }) => Promise<void>;
  onRefresh: () => void;
}

export default function PropertiesView({
  properties,
  brokers,
  onUpdateProperty,
  onRefresh,
}: PropertiesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [actionModal, setActionModal] = useState<{
    property: Property;
    action: 'Approve' | 'Reject' | 'RequestChanges' | 'Suspend' | 'Restore';
  } | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: (PropertyCategory | 'All')[] = ['All', 'PG', 'Flat', 'Room', 'Hostel'];
  const statuses: (PropertyApprovalStatus | 'All')[] = [
    'All',
    'Pending Admin Approval',
    'Approved',
    'Rejected',
    'Suspended',
    'Unavailable',
  ];

  const filtered = properties.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesStat = selectedStatus === 'All' || p.approvalStatus === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      p.name.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.locality.toLowerCase().includes(q) ||
      p.ownerName.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q);
    return matchesCat && matchesStat && matchesQuery;
  });

  const handleActionSubmit = async () => {
    if (!actionModal) return;
    setIsSubmitting(true);
    const { property, action } = actionModal;

    let newStatus: PropertyApprovalStatus = property.approvalStatus;
    if (action === 'Approve') newStatus = 'Approved';
    if (action === 'Reject') newStatus = 'Rejected';
    if (action === 'RequestChanges') newStatus = 'Pending Admin Approval';
    if (action === 'Suspend') newStatus = 'Suspended';
    if (action === 'Restore') newStatus = 'Approved';

    await onUpdateProperty({
      id: property.id,
      approvalStatus: newStatus,
      adminFeedback: feedbackInput || (action === 'Approve' ? 'Approved by Admin' : undefined),
    });

    setIsSubmitting(false);
    setActionModal(null);
    setFeedbackInput('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Filters and search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  selectedCategory === cat ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden"
          >
            {statuses.map(st => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by property, city, locality, owner..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Property ID</th>
                <th className="py-3 px-4">Property Name & Category</th>
                <th className="py-3 px-4">Owner & Broker</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Rent & Deposit</th>
                <th className="py-3 px-4">Submission Date</th>
                <th className="py-3 px-4">Approval Status</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No matching property listings found.
                  </td>
                </tr>
              ) : (
                filtered.map(prop => (
                  <tr key={prop.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {prop.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{prop.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-sm">
                          {prop.category}
                        </span>
                        <span className="text-[11px] text-slate-500">{prop.furnishing}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{prop.ownerName}</div>
                      <div className="text-[11px] text-slate-400">
                        {prop.brokerName ? `Broker: ${prop.brokerName}` : 'Direct Host'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{prop.locality}</div>
                      <div className="text-[11px] text-slate-400">{prop.city}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                      <div>₹{prop.monthlyRent.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-400">/mo</span></div>
                      <div className="text-[10px] font-normal text-slate-500">Dep: ₹{prop.securityDeposit.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 tabular-nums">
                      {new Date(prop.submissionDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          prop.approvalStatus === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : prop.approvalStatus === 'Pending Admin Approval'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {prop.approvalStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-semibold ${
                        prop.availabilityStatus === 'Available' ? 'text-emerald-600' : 'text-slate-500'
                      }`}>
                        {prop.availabilityStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedProperty(prop)}
                        className="px-2 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>

                      {prop.approvalStatus === 'Pending Admin Approval' && (
                        <>
                          <button
                            onClick={() => setActionModal({ property: prop, action: 'Approve' })}
                            className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setActionModal({ property: prop, action: 'Reject' })}
                            className="px-2 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {prop.approvalStatus === 'Approved' && (
                        <button
                          onClick={() => setActionModal({ property: prop, action: 'Suspend' })}
                          className="px-2 py-1 rounded-md border border-rose-200 text-rose-700 hover:bg-rose-50 font-medium"
                        >
                          Suspend
                        </button>
                      )}

                      {prop.approvalStatus === 'Suspended' && (
                        <button
                          onClick={() => setActionModal({ property: prop, action: 'Restore' })}
                          className="px-2 py-1 rounded-md border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-medium"
                        >
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{selectedProperty.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-sm bg-blue-100 text-blue-800 font-bold">
                    {selectedProperty.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedProperty.id} · {selectedProperty.locality}, {selectedProperty.city}</p>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Images Gallery */}
            {selectedProperty.images && selectedProperty.images.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1.5">Submitted Property Photos</span>
                <div className="grid grid-cols-2 gap-2">
                  {selectedProperty.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={selectedProperty.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-36 object-cover rounded-lg border border-slate-200"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
              <span className="font-bold text-slate-900 block mb-1">Description</span>
              <p>{selectedProperty.description}</p>
            </div>

            {/* Room Bed Units */}
            {selectedProperty.roomBedOptions && selectedProperty.roomBedOptions.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1.5">Bed / Unit Inventory</span>
                <div className="space-y-1.5">
                  {selectedProperty.roomBedOptions.map(bed => (
                    <div
                      key={bed.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{bed.name}</span>
                        <span className="text-slate-400 ml-2">({bed.type})</span>
                      </div>
                      <div className="text-right tabular-nums">
                        <span className="font-bold text-slate-900">₹{bed.rent.toLocaleString('en-IN')}/mo</span>
                        <span className="text-slate-500 ml-2">({bed.occupiedUnits}/{bed.totalUnits} Units Occupied)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5">Verified Amenities</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedProperty.amenities.map(am => (
                  <span key={am} className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 text-[11px] font-medium">
                    ✓ {am}
                  </span>
                ))}
              </div>
            </div>

            {selectedProperty.adminFeedback && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                <span className="font-bold block">Admin Feedback / Verification Notes:</span>
                <p className="mt-0.5">{selectedProperty.adminFeedback}</p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedProperty(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decision / Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {actionModal.action === 'Approve' && 'Approve Property for Public Listing'}
              {actionModal.action === 'Reject' && 'Reject Property Submission'}
              {actionModal.action === 'RequestChanges' && 'Request Owner Corrections'}
              {actionModal.action === 'Suspend' && 'Suspend Property Listing'}
              {actionModal.action === 'Restore' && 'Restore Property Listing'}
            </h3>
            <p className="text-xs text-slate-600">
              Listing: <strong>{actionModal.property.name}</strong> ({actionModal.property.id})
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Administrative Notes / Feedback for Host:
              </label>
              <textarea
                rows={3}
                value={feedbackInput}
                onChange={e => setFeedbackInput(e.target.value)}
                placeholder="Include verification details or requirements..."
                className="w-full p-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setActionModal(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleActionSubmit}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
