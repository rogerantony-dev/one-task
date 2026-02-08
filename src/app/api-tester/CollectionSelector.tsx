import { useCollectionContext } from "@/app/context/CollectionContext";
import { CollectionForm } from "@/app/api-tester/CollectionForm";
import { colors } from "@/theme";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export function CollectionSelector() {
  const {
    collections,
    currentCollectionId,
    currentCollection,
    setCurrentCollection,
    createCollection,
    updateCollection,
  } = useCollectionContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingCollection, setEditingCollection] = useState<{
    id: number;
    name: string;
    baseUrlProd: string;
    baseUrlDev: string | null;
    baseUrlCustom: string | null;
  } | null>(null);

  const handleSelect = (id: number) => {
    setCurrentCollection(id);
    setModalVisible(false);
  };

  const handleCreateNew = () => {
    setEditingCollection(null);
    setFormVisible(true);
  };

  const handleEdit = (c: { id: number; name: string; base_url_prod: string; base_url_dev: string; base_url_custom: string | null }) => {
    setEditingCollection({
      id: c.id,
      name: c.name,
      baseUrlProd: c.base_url_prod,
      baseUrlDev: c.base_url_dev || null,
      baseUrlCustom: c.base_url_custom,
    });
    setModalVisible(false);
    setFormVisible(true);
  };

  const handleSaveCreate = async (data: { name: string; baseUrlProd: string; baseUrlDev: string | null; baseUrlCustom: string | null }) => {
    const row = await createCollection(data);
    setCurrentCollection(row.id);
    setFormVisible(false);
  };

  const handleSaveEdit = async (data: { name: string; baseUrlProd: string; baseUrlDev: string | null; baseUrlCustom: string | null }) => {
    if (!editingCollection) return;
    await updateCollection(editingCollection.id, data);
    setFormVisible(false);
    setEditingCollection(null);
  };

  const displayName = currentCollection?.name ?? "Select collection";

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.trigger}>
        <Text style={styles.triggerText} numberOfLines={1}>
          {displayName}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Collections</Text>
            <TouchableOpacity
              style={[styles.item, currentCollectionId === null && styles.itemActive]}
              onPress={() => {
                setCurrentCollection(null);
                setModalVisible(false);
              }}
            >
              <Text
                style={[styles.itemText, currentCollectionId === null && styles.itemTextActive]}
              >
                No collection
              </Text>
            </TouchableOpacity>
            <ScrollView style={styles.list}>
              {collections.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.item, currentCollectionId === c.id && styles.itemActive]}
                  onPress={() => handleSelect(c.id)}
                  onLongPress={() => handleEdit(c)}
                >
                  <Text
                    style={[styles.itemText, currentCollectionId === c.id && styles.itemTextActive]}
                    numberOfLines={1}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.createBtn} onPress={handleCreateNew}>
              <Text style={styles.createBtnText}>Create collection</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {formVisible && !editingCollection && (
        <CollectionForm
          visible={formVisible}
          onSave={handleSaveCreate}
          onCancel={() => setFormVisible(false)}
        />
      )}
      {formVisible && editingCollection && (
        <CollectionForm
          visible={formVisible}
          initial={{
            name: editingCollection.name,
            baseUrlProd: editingCollection.baseUrlProd,
            baseUrlDev: editingCollection.baseUrlDev,
            baseUrlCustom: editingCollection.baseUrlCustom,
          }}
          onSave={handleSaveEdit}
          onCancel={() => {
            setFormVisible(false);
            setEditingCollection(null);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: 160,
  },
  triggerText: {
    color: colors.white,
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    width: "100%",
    maxWidth: 320,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  list: {
    maxHeight: 240,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemActive: {
    backgroundColor: colors.light,
  },
  itemText: {
    fontSize: 15,
    color: colors.text,
  },
  itemTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  createBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  createBtnText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 15,
  },
  closeBtn: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  closeBtnText: {
    color: colors.muted,
    fontSize: 15,
  },
});
