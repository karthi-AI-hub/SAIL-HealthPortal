import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import { getFirestore, collection, doc, getDoc, setDoc } from "firebase/firestore";

const AddFamilyMemberDialog = ({ open, onClose, employeeId, onFamilyMemberAdded, saving }) => {
  const [newFamilyMemberData, setNewFamilyMemberData] = useState({
    Name: "",
    Relation: "",
    Age: "",
    Email: "",
    Phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const db = getFirestore();

  const handleSaveFamilyMember = async () => {
    setIsSaving(true);
    try {
      const familyRef = collection(db, "Employee", employeeId, "Family");
      let relationCount = 1;
      let newMemberId = `${employeeId}_${newFamilyMemberData.Relation}`;

      while (true) {
        const docRef = doc(familyRef, newMemberId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          break;
        }
        relationCount++;
        newMemberId = `${employeeId}_${newFamilyMemberData.Relation}${relationCount}`;
      }

      await setDoc(doc(familyRef, newMemberId), newFamilyMemberData);
      onFamilyMemberAdded();
      onClose();
      setNewFamilyMemberData({ Name: "", Relation: "", Age: "", Email: "", Phone: "" });
    } catch (err) {
      console.error("Failed to add family member:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Family Member</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          value={newFamilyMemberData.Name}
          onChange={(e) => setNewFamilyMemberData({ ...newFamilyMemberData, Name: e.target.value })}
          fullWidth
          variant="outlined"
          margin="normal"
        />
        <TextField
          label="Relation"
          value={newFamilyMemberData.Relation}
          onChange={(e) => setNewFamilyMemberData({ ...newFamilyMemberData, Relation: e.target.value })}
          fullWidth
          variant="outlined"
          margin="normal"
        />
        <TextField
          label="Age"
          value={newFamilyMemberData.Age}
          onChange={(e) => setNewFamilyMemberData({ ...newFamilyMemberData, Age: e.target.value })}
          fullWidth
          variant="outlined"
          margin="normal"
        />
        <TextField
          label="Email"
          value={newFamilyMemberData.Email}
          onChange={(e) => setNewFamilyMemberData({ ...newFamilyMemberData, Email: e.target.value })}
          fullWidth
          variant="outlined"
          margin="normal"
        />
        <TextField
          label="Phone"
          value={newFamilyMemberData.Phone}
          onChange={(e) => setNewFamilyMemberData({ ...newFamilyMemberData, Phone: e.target.value })}
          fullWidth
          variant="outlined"
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSaveFamilyMember} color="primary" disabled={isSaving}>
          {isSaving ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFamilyMemberDialog;