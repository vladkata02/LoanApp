import React, { useState } from 'react';
import { type LoanApplicationNoteDto } from '../types/loanApplication';

interface NotesProps {
  notes: LoanApplicationNoteDto[];
  isAdmin: boolean;
  loanApplicationId: number;
  onAddNote: (content: string, isFromAdmin: boolean) => Promise<void>;
}

const Notes: React.FC<NotesProps> = ({ notes, isAdmin, loanApplicationId, onAddNote }) => {
  const [newNote, setNewNote] = useState<string>('');
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [showAddNote, setShowAddNote] = useState<boolean>(false);
  const [noteError, setNoteError] = useState<string>('');

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsAddingNote(true);
    setNoteError('');
    
    try {
      await onAddNote(newNote.trim(), isAdmin);
      setNewNote('');
      setShowAddNote(false);
    } catch (error) {
      setNoteError('Failed to add note. Please try again.');
    } finally {
      setIsAddingNote(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedNotes = [...notes].sort((a, b) => 
    new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
  );
  
  const canAddNotes = isAdmin || notes.length > 0;

  return (
    <div className="space-y-4">
      {/* Notes Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Notes & Communication</h3>
        {canAddNotes && (
          <button
            onClick={() => setShowAddNote(!showAddNote)}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm transition-colors duration-200"
          >
            {showAddNote ? 'Cancel' : isAdmin ? 'Add Review Note' : 'Reply'}
          </button>
        )}
      </div>

      {/* Add Note Section */}
      {showAddNote && canAddNotes && (
        <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
          {noteError && (
            <div className="bg-red-600 text-white p-2 rounded mb-3 text-sm">
              {noteError}
            </div>
          )}
          
          <div className="mb-3">
            <label className="block text-gray-400 text-sm mb-2">
              {isAdmin ? 'Admin Review Note' : 'Customer Response'}
            </label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder={isAdmin ? 'Add review comments...' : 'Reply to administrator...'}
              className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:border-indigo-500 outline-none text-white resize-none"
              rows={3}
              maxLength={1000}
            />
            <div className="text-right text-gray-400 text-xs mt-1">
              {newNote.length}/1000 characters
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim() || isAddingNote}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors duration-200"
            >
              {isAddingNote ? 'Adding...' : (isAdmin ? 'Add Note' : 'Reply')}
            </button>
            <button
              onClick={() => {
                setShowAddNote(false);
                setNewNote('');
                setNoteError('');
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {sortedNotes.length === 0 ? (
          <div className="text-gray-400 text-center py-8 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-lg mb-2">No notes yet</p>
            <p className="text-sm">
              {isAdmin 
                ? 'Start the conversation by adding review notes to communicate with the customer.'
                : 'No communication from administrators yet. Administrator will add review notes if needed.'
              }
            </p>
            {/* Only show button for admins when there are no notes */}
            {isAdmin && !showAddNote && (
              <button
                onClick={() => setShowAddNote(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors duration-200"
              >
                Add First Review Note
              </button>
            )}
          </div>
        ) : (
          sortedNotes.map((note) => (
            <div
              key={note.loanApplicationNoteId}
              className={`rounded-lg p-4 border ${
                note.isFromAdmin
                  ? 'bg-blue-600 bg-opacity-20 border-blue-600'
                  : 'bg-gray-700 border-gray-600'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      note.isFromAdmin
                        ? 'bg-blue-600 text-blue-100'
                        : 'bg-gray-600 text-gray-100'
                    }`}
                  >
                    {note.isFromAdmin ? 'Administrator' : 'Customer'}
                  </span>
                </div>
                <span className="text-gray-400 text-xs">
                  {formatDate(note.sentAt)}
                </span>
              </div>
              <p className={`${note.isFromAdmin ? 'text-blue-100' : 'text-gray-100'} whitespace-pre-wrap`}>
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notes;